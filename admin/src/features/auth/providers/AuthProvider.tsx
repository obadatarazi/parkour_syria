import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router";

import { ROUTES } from "@/app/router/routes";
import { authService } from "@/features/auth/services/auth.service";
import { subscribeSessionEnded } from "@/features/auth/session/auth-session-events";
import { subscribeAuthTabMessages } from "@/features/auth/session/auth-tab-sync";
import type {
  AuthUser,
  ChangePasswordInput,
  LoginCredentials,
  ProfileUpdateInput,
} from "@/features/auth/types/auth.types";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { registerAuthSessionRecoveryHandlers } from "@/shared/lib/api/auth-session-recovery-bridge";
import { notify } from "@/shared/lib/notifications";

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (input: ProfileUpdateInput) => Promise<AuthUser>;
  changePassword: (input: ChangePasswordInput) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const t = useTranslation();
  const [user, setUser] = useState<AuthUser | null>(() => authService.getSession());
  const [isLoading, setIsLoading] = useState(true);
  /**
   * Provider-side generation so a stale restore/login/logout promise cannot
   * call setUser after a newer auth operation has already updated React state.
   * Complements the auth-service generation that guards localStorage writes.
   */
  const authStateGenerationRef = useRef(0);
  const sessionExpiredToastShownRef = useRef(false);

  useEffect(() => {
    const generation = authStateGenerationRef.current;
    let cancelled = false;

    async function restore() {
      try {
        const restoredUser = await authService.restoreSession();
        if (!cancelled && authStateGenerationRef.current === generation) {
          setUser(restoredUser);
        }
      } finally {
        if (!cancelled && authStateGenerationRef.current === generation) {
          setIsLoading(false);
        }
      }
    }

    void restore();

    return () => {
      cancelled = true;
    };
  }, []);

  // Wire apiRequest 401 recovery → authService (no React inside api-client).
  useEffect(() => {
    registerAuthSessionRecoveryHandlers({
      refreshSession: () => authService.refreshTokens(),
      endSession: () => authService.endExpiredSession(),
    });
    return () => registerAuthSessionRecoveryHandlers(null);
  }, []);

  // Proactive refresh while the dashboard is open (idle tabs + periodic check).
  useEffect(() => {
    if (!user) return;

    const refreshIfNeeded = () => {
      void authService.ensureFreshAccessToken().catch(() => {
        // 401 path / next request handles hard session death.
      });
    };

    refreshIfNeeded();

    const intervalId = window.setInterval(refreshIfNeeded, 60_000);
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        refreshIfNeeded();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [user]);

  // UI side effects for forced session end (idempotent toast + single redirect).
  useEffect(() => {
    return subscribeSessionEnded(() => {
      authStateGenerationRef.current += 1;
      setUser(null);
      setIsLoading(false);

      if (!sessionExpiredToastShownRef.current) {
        sessionExpiredToastShownRef.current = true;
        notify.error(t.sessionExpiredTitle, t.sessionExpiredDescription);
      }

      navigate(ROUTES.login, { replace: true });
    });
  }, [navigate, t.sessionExpiredDescription, t.sessionExpiredTitle]);

  // Multi-tab auth sync (BroadcastChannel, or storage fallback). Same tab is not notified.
  useEffect(() => {
    return subscribeAuthTabMessages((message) => {
      authStateGenerationRef.current += 1;

      if (message.type === "login") {
        sessionExpiredToastShownRef.current = false;
        const nextUser = authService.applyRemoteAuthSync("login");
        setUser(nextUser);
        setIsLoading(false);
        return;
      }

      authService.applyRemoteAuthSync(message.type);
      setUser(null);
      setIsLoading(false);

      if (message.type === "session_expired") {
        if (!sessionExpiredToastShownRef.current) {
          sessionExpiredToastShownRef.current = true;
          notify.error(t.sessionExpiredTitle, t.sessionExpiredDescription);
        }
      } else {
        // Intentional logout from another tab — never show session-expired toast.
        sessionExpiredToastShownRef.current = false;
      }

      navigate(ROUTES.login, { replace: true });
    });
  }, [navigate, t.sessionExpiredDescription, t.sessionExpiredTitle]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const generation = ++authStateGenerationRef.current;
    sessionExpiredToastShownRef.current = false;
    setIsLoading(true);
    try {
      const nextUser = await authService.login(credentials);
      if (authStateGenerationRef.current === generation) {
        setUser(nextUser);
      }
    } finally {
      if (authStateGenerationRef.current === generation) {
        setIsLoading(false);
      }
    }
  }, []);

  const logout = useCallback(async () => {
    const generation = ++authStateGenerationRef.current;
    sessionExpiredToastShownRef.current = false;
    // Clear React auth state immediately so UI cannot keep acting as logged-in
    // while the remote logout request is still in flight.
    setUser(null);
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      if (authStateGenerationRef.current === generation) {
        setUser(null);
        setIsLoading(false);
      }
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    const generation = authStateGenerationRef.current;
    const nextUser = await authService.getProfile();
    if (authStateGenerationRef.current === generation) {
      setUser(nextUser);
    }
  }, []);

  const updateProfile = useCallback(async (input: ProfileUpdateInput) => {
    const generation = authStateGenerationRef.current;
    const nextUser = await authService.updateProfile(input);
    if (authStateGenerationRef.current === generation) {
      setUser(nextUser);
    }
    return nextUser;
  }, []);

  const changePassword = useCallback(async (input: ChangePasswordInput) => {
    await authService.changePassword(input);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      logout,
      refreshProfile,
      updateProfile,
      changePassword,
    }),
    [user, isLoading, login, logout, refreshProfile, updateProfile, changePassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
