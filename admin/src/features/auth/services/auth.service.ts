import type { AuthService } from "@/features/auth/services/auth.service.types";
import { emitSessionEnded } from "@/features/auth/session/auth-session-events";
import { broadcastAuthTabMessage } from "@/features/auth/session/auth-tab-sync";
import type {
  AuthSession,
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginCredentials,
  ProfileUpdateInput,
  ResetPasswordInput,
} from "@/features/auth/types/auth.types";
import {
  clearStoredSession,
  readStoredSession,
  readStoredToken,
  readStoredUser,
  writeStoredSession,
} from "@/features/auth/utils/auth-storage";
import { isAccessTokenNearingExpiry } from "@/features/auth/utils/access-token-expiry";
import { mapApiRolesToAuthRoles, mapApiUserToAuthUser } from "@/features/auth/utils/map-api-user";
import { invalidateQueryCache } from "@/shared/crud/query-cache";
import { getServiceErrorCode, ServiceError } from "@/shared/errors";
import {
  type ApiLoginData,
  type ApiProfileData,
  apiRequest,
  type ApiRoleData,
  type LaravelSuccessResponse,
} from "@/shared/lib/api";
import {
  appendFile,
  appendOptional,
  submitMultipartFormData,
} from "@/shared/lib/api/form-data.utils";
/** Drop all in-memory CRUD list/detail cache on auth identity changes. */
function clearCrudQueryCache(): void {
  invalidateQueryCache();
}

/**
 * Monotonic auth generation. Bumped on login/logout so in-flight restore
 * (or other async auth work) cannot write storage after being superseded.
 */
let authGeneration = 0;

function bumpAuthGeneration(): number {
  authGeneration += 1;
  return authGeneration;
}

function isCurrentAuthGeneration(generation: number): boolean {
  return generation === authGeneration;
}

class AuthSupersededError extends Error {
  readonly code = "auth_superseded";

  constructor() {
    super("Authentication operation was superseded");
    this.name = "AuthSupersededError";
  }
}

/** Single-flight refresh promise shared across concurrent 401 recoveries. */
let refreshInFlight: Promise<void> | null = null;

/** Ensures end-expired-session runs at most once until the next login. */
let sessionEndInProgress = false;

function createApiAuthService(): AuthService {
  async function fetchRoles(token?: string) {
    const response = await apiRequest<LaravelSuccessResponse<ApiRoleData | ApiRoleData[]>>(
      "/admin/me/roles",
      token ? { token } : undefined,
    );
    return mapApiRolesToAuthRoles(response.data);
  }

  async function buildSession(
    data: ApiLoginData,
    generation: number,
    token?: string,
  ): Promise<AuthSession> {
    const roles = await fetchRoles(token ?? data.token);
    if (!isCurrentAuthGeneration(generation)) {
      throw new AuthSupersededError();
    }

    const session: AuthSession = {
      user: mapApiUserToAuthUser(data.user, { roles }),
      token: data.token,
      refreshToken: data.refreshToken,
      tokenIssuedAt: Date.now(),
    };
    writeStoredSession(session);
    return session;
  }

  /**
   * True when storage already holds a usable session that is not the one we
   * started refreshing with (typically another tab won the RT rotation race).
   */
  function hasReplacementSession(
    startedRefreshToken: string,
    startedAccessToken: string,
  ): boolean {
    const latest = readStoredSession();
    if (!latest?.token || !latest.refreshToken) return false;
    return (
      latest.refreshToken !== startedRefreshToken || latest.token !== startedAccessToken
    );
  }

  async function performTokenRefresh(): Promise<void> {
    const generation = authGeneration;
    const existing = readStoredSession();
    if (!existing?.refreshToken || !existing.token) {
      throw new ServiceError("session_expired");
    }

    const startedRefreshToken = existing.refreshToken;
    const startedAccessToken = existing.token;

    try {
      const response = await apiRequest<
        LaravelSuccessResponse<{ token: string; refreshToken: string }>
      >("/admin/auth/refresh-token", {
        method: "POST",
        body: { refreshToken: startedRefreshToken },
        skipAuth: true,
        skipSessionRecovery: true,
      });

      if (!isCurrentAuthGeneration(generation)) {
        throw new AuthSupersededError();
      }

      const latest = readStoredSession();
      // Manual logout (or remote teardown) cleared storage — do not resurrect.
      if (!latest) {
        throw new AuthSupersededError();
      }

      // Another tab already wrote rotated tokens — adopt them; do not overwrite.
      if (latest.refreshToken !== startedRefreshToken) {
        if (latest.token) return;
        throw new AuthSupersededError();
      }

      const nextToken = response.data?.token;
      const nextRefreshToken = response.data?.refreshToken;
      if (!nextToken || !nextRefreshToken) {
        throw new ServiceError("session_expired");
      }

      writeStoredSession({
        ...latest,
        token: nextToken,
        refreshToken: nextRefreshToken,
        tokenIssuedAt: Date.now(),
      });
    } catch (error) {
      // Prefer adopting another tab's rotated session over treating this as failure.
      if (hasReplacementSession(startedRefreshToken, startedAccessToken)) {
        return;
      }

      if (error instanceof AuthSupersededError) {
        throw error;
      }

      throw error;
    }
  }

  return {
    getSession() {
      return readStoredUser();
    },

    getAccessToken() {
      return readStoredToken();
    },

    async restoreSession() {
      const generation = authGeneration;
      const token = readStoredToken();
      if (!token) return null;

      try {
        const [response, roles] = await Promise.all([
          apiRequest<LaravelSuccessResponse<ApiProfileData>>("/admin/me/profile", { token }),
          fetchRoles(token),
        ]);

        if (!isCurrentAuthGeneration(generation)) {
          return null;
        }
        if (readStoredToken() !== token) {
          return null;
        }

        const existing = readStoredSession();
        const session: AuthSession = {
          user: mapApiUserToAuthUser(response.data.user, { roles }),
          token,
          refreshToken: existing?.refreshToken ?? "",
          // Seed fallback TTL for legacy sessions that predate tokenIssuedAt.
          tokenIssuedAt: existing?.tokenIssuedAt ?? Date.now(),
        };
        writeStoredSession(session);
        return session.user;
      } catch (error) {
        if (error instanceof AuthSupersededError || !isCurrentAuthGeneration(generation)) {
          return null;
        }

        const code = getServiceErrorCode(error);
        if (
          code === "invalid_credentials" ||
          code === "permission_denied" ||
          code === "session_expired"
        ) {
          if (isCurrentAuthGeneration(generation) && readStoredToken() === token) {
            clearStoredSession();
            clearCrudQueryCache();
          }
          return null;
        }

        return readStoredUser();
      }
    },

    async login(credentials: LoginCredentials) {
      const generation = bumpAuthGeneration();
      // Allow future expired-session handling after a fresh login.
      sessionEndInProgress = false;
      clearCrudQueryCache();

      const response = await apiRequest<LaravelSuccessResponse<ApiLoginData>>(
        "/admin/auth/login",
        {
          method: "POST",
          body: {
            email: credentials.email.trim(),
            password: credentials.password,
          },
          skipAuth: true,
        },
      );

      if (!isCurrentAuthGeneration(generation)) {
        throw new AuthSupersededError();
      }

      const session = await buildSession(response.data, generation);
      broadcastAuthTabMessage({ type: "login" });
      return session.user;
    },

    async logout() {
      bumpAuthGeneration();
      // Mark session as intentionally ended so a racing refresh failure cannot
      // emit "session expired" / show the expiry toast after manual logout.
      sessionEndInProgress = true;
      // Drop the pointer so a later login can start a new single-flight refresh.
      // Identity-safe `.finally` prevents the old promise from clearing a newer one.
      refreshInFlight = null;

      const token = readStoredToken();
      clearStoredSession();
      clearCrudQueryCache();
      broadcastAuthTabMessage({ type: "logout" });

      if (token) {
        try {
          await apiRequest("/admin/auth/logout", {
            method: "GET",
            token,
            skipSessionRecovery: true,
          });
        } catch {
          // Session is cleared locally regardless of remote logout result.
        }
      }
    },

    async refreshTokens() {
      if (!refreshInFlight) {
        const pending = performTokenRefresh().finally(() => {
          // Only the active in-flight promise may clear the slot.
          if (refreshInFlight === pending) {
            refreshInFlight = null;
          }
        });
        refreshInFlight = pending;
      }
      await refreshInFlight;
    },

    /**
     * Refresh when the access token is inside the skew window (or already past
     * fallback TTL). No-op when the session is fresh — used before API calls
     * and on focus/interval so callers rarely hit a 401 first.
     */
    async ensureFreshAccessToken() {
      const session = readStoredSession();
      if (!session?.token || !session.refreshToken) {
        return;
      }

      if (
        !isAccessTokenNearingExpiry(session.token, {
          issuedAtMs: session.tokenIssuedAt,
        })
      ) {
        return;
      }

      if (!refreshInFlight) {
        const pending = performTokenRefresh().finally(() => {
          if (refreshInFlight === pending) {
            refreshInFlight = null;
          }
        });
        refreshInFlight = pending;
      }
      await refreshInFlight;
    },

    endExpiredSession() {
      // Manual logout (or a prior expiry) already tore the session down.
      if (sessionEndInProgress) return;

      // Storage already cleared (e.g. logout won the race) — do not toast expiry.
      if (!readStoredToken() && !readStoredSession()) {
        sessionEndInProgress = true;
        refreshInFlight = null;
        return;
      }

      sessionEndInProgress = true;
      bumpAuthGeneration();
      clearStoredSession();
      clearCrudQueryCache();
      refreshInFlight = null;
      emitSessionEnded("expired");
      broadcastAuthTabMessage({ type: "session_expired" });
    },

    applyRemoteAuthSync(type) {
      if (type === "login") {
        // Match local login: invalidate in-flight auth work and cached CRUD data.
        bumpAuthGeneration();
        sessionEndInProgress = false;
        refreshInFlight = null;
        clearCrudQueryCache();
        return readStoredUser();
      }

      // Silent teardown — UI toast/redirect handled by AuthProvider once.
      bumpAuthGeneration();
      sessionEndInProgress = true;
      refreshInFlight = null;
      clearStoredSession();
      clearCrudQueryCache();
      return null;
    },

    async getProfile() {
      const generation = authGeneration;
      const response = await apiRequest<LaravelSuccessResponse<ApiProfileData>>(
        "/admin/me/profile",
      );
      const roles = await fetchRoles();

      if (!isCurrentAuthGeneration(generation)) {
        throw new AuthSupersededError();
      }

      const user = mapApiUserToAuthUser(response.data.user, { roles });
      const session = readStoredSession();
      if (session) {
        writeStoredSession({ ...session, user });
      }
      return user;
    },

    async updateProfile(input: ProfileUpdateInput) {
      const generation = authGeneration;
      const formData = new FormData();
      appendOptional(formData, "fullName", input.fullName);
      appendOptional(formData, "email", input.email);
      appendOptional(formData, "phoneNumber", input.phoneNumber);
      appendOptional(formData, "gender", input.gender);
      appendOptional(formData, "dateOfBirth", input.dateOfBirth);
      appendFile(formData, "avatar", input.avatar);

      const { method, body } = submitMultipartFormData(formData, "PUT");

      const response = await apiRequest<LaravelSuccessResponse<ApiLoginData["user"]>>(
        "/admin/me/profile/update",
        {
          method,
          body,
        },
      );

      const roles = await fetchRoles();

      if (!isCurrentAuthGeneration(generation)) {
        throw new AuthSupersededError();
      }

      const user = mapApiUserToAuthUser(response.data, { roles });
      const session = readStoredSession();
      if (session) {
        writeStoredSession({ ...session, user });
      }
      return user;
    },

    async changePassword(input: ChangePasswordInput) {
      await apiRequest<LaravelSuccessResponse<string>>("/admin/me/password/change", {
        method: "POST",
        body: input,
      });
    },

    async forgotPassword(input: ForgotPasswordInput) {
      await apiRequest<LaravelSuccessResponse<string>>("/admin/me/password/forgot", {
        method: "POST",
        body: input,
        skipAuth: true,
      });
    },

    async resetPassword(input: ResetPasswordInput) {
      await apiRequest<LaravelSuccessResponse<string>>("/admin/me/password/reset", {
        method: "POST",
        body: input,
        skipAuth: true,
      });
    },
  };
}

export const authService: AuthService = createApiAuthService();
