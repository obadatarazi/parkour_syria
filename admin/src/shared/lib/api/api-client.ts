import { ServiceError } from "@/shared/errors";
import { isAccessTokenNearingExpiry } from "@/shared/lib/api/access-token-expiry";
import { getAuthSessionRecoveryHandlers } from "@/shared/lib/api/auth-session-recovery-bridge";
import { readAccessToken, readTokenIssuedAt } from "@/shared/lib/api/token";
import { env } from "@/shared/lib/env";

import { type ApiLocale,resolveApiLocale } from "./api-locale";
import { buildQueryString, mapLaravelError } from "./laravel.utils";

export type { ApiLocale } from "./api-locale";
export { getActiveApiLocale, setActiveApiLocale } from "./api-locale";

export type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown | FormData;
  params?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
  token?: string | null;
  /** Active UI locale (`en` | `ar`). Defaults to `parkour-admin-language` in localStorage. */
  locale?: ApiLocale | string;
  skipAuth?: boolean;
  /**
   * Skip mid-session 401 refresh/logout handling (login, refresh-token, etc.).
   * Prefer `skipAuth` for public endpoints; use this when a Bearer token is still sent.
   */
  skipSessionRecovery?: boolean;
  /** Internal: marks a single retry after a successful token refresh. */
  authRetry?: boolean;
  /**
   * Internal: one-shot adopt of a newer access token written by another tab
   * after an authRetry 401 (no second refresh).
   */
  authRetryAdopted?: boolean;
  /** Optional abort signal for cancelling in-flight fetches. */
  signal?: AbortSignal;
  /** Per-request override for the default client timeout (ms). Use `0` to disable. */
  timeoutMs?: number;
  /**
   * Return the response body as a file download instead of JSON.
   * Error payloads are still read as JSON when the server sends them that way.
   */
  responseType?: "json" | "blob";
};

export type ApiBlobResult = {
  blob: Blob;
  filename: string | null;
};

function filenameFromContentDisposition(header: string | null): string | null {
  if (!header) return null;

  const utfMatch = /filename\*=(?:UTF-8''|utf-8'')([^;]+)/i.exec(header);
  if (utfMatch?.[1]) {
    try {
      return decodeURIComponent(utfMatch[1].trim().replace(/^"(.*)"$/, "$1"));
    } catch {
      return utfMatch[1].trim();
    }
  }

  const asciiMatch = /filename="([^"]+)"|filename=([^;]+)/i.exec(header);
  const raw = asciiMatch?.[1] ?? asciiMatch?.[2];
  return raw?.trim() || null;
}

const REFRESH_TOKEN_PATH = "/admin/auth/refresh-token";
/** Default abort timeout so hung requests do not leave UI spinners forever. */
export const DEFAULT_API_REQUEST_TIMEOUT_MS = 45_000;

function resolveToken(options: ApiRequestOptions): string | null {
  if (options.skipAuth) return null;
  // After a successful refresh, always use the latest token from storage.
  // Ignore any stale explicit `token` captured on the original request.
  if (options.authRetry) return readAccessToken();
  if (options.token !== undefined) return options.token;
  return readAccessToken();
}

function isAbortError(error: unknown): boolean {
  if (error instanceof DOMException && error.name === "AbortError") return true;
  if (error instanceof Error && error.name === "AbortError") return true;
  return false;
}

function isTimeoutAbortError(error: unknown): boolean {
  if (error instanceof DOMException && error.name === "TimeoutError") return true;
  if (error instanceof Error && error.name === "TimeoutError") return true;
  return false;
}

/**
 * Combines the caller signal with an optional timeout. Prefer AbortSignal.any /
 * AbortSignal.timeout when available; fall back to a linked AbortController.
 */
function composeRequestSignal(
  callerSignal: AbortSignal | undefined,
  timeoutMs: number,
): { signal?: AbortSignal; cleanup: () => void } {
  if (timeoutMs <= 0) {
    return { signal: callerSignal, cleanup: () => undefined };
  }

  const timeoutSignal =
    typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function"
      ? AbortSignal.timeout(timeoutMs)
      : undefined;

  if (timeoutSignal && typeof AbortSignal.any === "function") {
    const signals = callerSignal ? [callerSignal, timeoutSignal] : [timeoutSignal];
    return { signal: AbortSignal.any(signals), cleanup: () => undefined };
  }

  const controller = new AbortController();
  const onCallerAbort = () => {
    controller.abort(callerSignal?.reason);
  };

  if (callerSignal) {
    if (callerSignal.aborted) {
      controller.abort(callerSignal.reason);
    } else {
      callerSignal.addEventListener("abort", onCallerAbort, { once: true });
    }
  }

  if (timeoutSignal) {
    const onTimeoutAbort = () => controller.abort(timeoutSignal.reason);
    if (timeoutSignal.aborted) {
      controller.abort(timeoutSignal.reason);
    } else {
      timeoutSignal.addEventListener("abort", onTimeoutAbort, { once: true });
    }
    return {
      signal: controller.signal,
      cleanup: () => {
        callerSignal?.removeEventListener("abort", onCallerAbort);
        timeoutSignal.removeEventListener("abort", onTimeoutAbort);
      },
    };
  }

  const timeoutId = setTimeout(() => {
    controller.abort(new DOMException("TimeoutError", "TimeoutError"));
  }, timeoutMs);

  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timeoutId);
      callerSignal?.removeEventListener("abort", onCallerAbort);
    },
  };
}

function shouldAttemptSessionRecovery(path: string, options: ApiRequestOptions): boolean {
  if (options.skipAuth) return false;
  if (options.skipSessionRecovery) return false;
  if (options.authRetry) return false;
  if (path === REFRESH_TOKEN_PATH || path.endsWith(REFRESH_TOKEN_PATH)) return false;
  // No stored session → nothing to refresh/logout for.
  if (!readAccessToken()) return false;
  return getAuthSessionRecoveryHandlers() != null;
}

function isAuthSupersededError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { name?: string; code?: string };
  return candidate.name === "AuthSupersededError" || candidate.code === "auth_superseded";
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const {
    method = "GET",
    body,
    params,
    headers = {},
    locale,
    skipAuth,
    signal: callerSignal,
    timeoutMs = DEFAULT_API_REQUEST_TIMEOUT_MS,
    responseType = "json",
  } = options;

  // Rotate the access token before the request when it is inside the skew window.
  if (shouldAttemptSessionRecovery(path, options)) {
    const pendingToken = resolveToken({ ...options, skipAuth });
    if (
      pendingToken &&
      isAccessTokenNearingExpiry(pendingToken, {
        issuedAtMs: readTokenIssuedAt(),
      })
    ) {
      const recovery = getAuthSessionRecoveryHandlers();
      if (recovery) {
        try {
          await recovery.refreshSession();
        } catch {
          // Keep going; the 401 recovery path still handles hard failures.
        }
      }
    }
  }

  const token = resolveToken({ ...options, skipAuth });
  const { signal, cleanup } = composeRequestSignal(callerSignal, timeoutMs);
  const resolvedLocale = resolveApiLocale(locale);

  // X-Locale is set last so callers cannot override the active ar/en locale.
  const requestHeaders: Record<string, string> = {
    Accept: responseType === "blob" ? "text/csv, application/json" : "application/json",
    ...headers,
    "Accept-Language": resolvedLocale,
    "X-Locale": resolvedLocale,
  };

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  let requestBody: BodyInit | undefined;
  if (body instanceof FormData) {
    requestBody = body;
  } else if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
    requestBody = JSON.stringify(body);
  }

  const url = `${env.apiUrl}${path}${buildQueryString(params)}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: requestBody,
      signal,
    });
  } catch (error) {
    cleanup();
    if (callerSignal?.aborted || isAbortError(error)) {
      throw error instanceof Error ? error : new DOMException("Aborted", "AbortError");
    }
    if (isTimeoutAbortError(error) || signal?.aborted) {
      throw new ServiceError("request_timeout");
    }
    throw new ServiceError("network_error");
  }
  cleanup();

  if (response.status === 204) {
    return undefined as T;
  }

  if (responseType === "blob" && response.ok) {
    const blob = await response.blob();
    return {
      blob,
      filename: filenameFromContentDisposition(response.headers.get("content-disposition")),
    } as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    if (response.status === 401 && shouldAttemptSessionRecovery(path, options)) {
      const recovery = getAuthSessionRecoveryHandlers();
      if (recovery) {
        const accessTokenBeforeRefresh = readAccessToken();
        try {
          await recovery.refreshSession();
          return apiRequest<T>(path, { ...options, authRetry: true });
        } catch (error) {
          // Another tab may have rotated tokens into storage while this refresh failed.
          const accessTokenAfter = readAccessToken();
          if (accessTokenAfter && accessTokenAfter !== accessTokenBeforeRefresh) {
            return apiRequest<T>(path, { ...options, authRetry: true });
          }

          // Superseded (logout / generation bump / intentional teardown) — never endSession.
          if (isAuthSupersededError(error)) {
            throw new ServiceError("session_expired");
          }

          // Still have the same pre-refresh token → real auth failure.
          // Empty storage (manual logout) → endSession is a no-op (no toast).
          recovery.endSession();
          throw new ServiceError("session_expired");
        }
      }
    }

    // Refresh already ran; retried request still 401 → session is invalid.
    // Do not refresh again (authRetry blocks shouldAttemptSessionRecovery).
    if (
      response.status === 401 &&
      options.authRetry &&
      !options.skipAuth &&
      !options.skipSessionRecovery
    ) {
      const latestToken = readAccessToken();
      // Another tab wrote a newer access token while this retry was in flight —
      // adopt it once without a second refresh; do not destroy that session.
      if (
        !options.authRetryAdopted &&
        latestToken &&
        token &&
        latestToken !== token
      ) {
        return apiRequest<T>(path, {
          ...options,
          authRetry: true,
          authRetryAdopted: true,
        });
      }

      // Only end the session that this attempt actually used. If storage already
      // moved to a different token (or we just adopted another tab's login), do
      // not clear/broadcast — that session belongs to a newer identity.
      const sessionStillOwnedByThisAttempt =
        Boolean(token) && latestToken === token && !options.authRetryAdopted;

      if (sessionStillOwnedByThisAttempt) {
        getAuthSessionRecoveryHandlers()?.endSession();
      }

      throw new ServiceError("session_expired");
    }

    throw mapLaravelError(response.status, payload);
  }

  return payload as T;
}
