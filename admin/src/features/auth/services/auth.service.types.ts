import type {
  AuthUser,
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginCredentials,
  ProfileUpdateInput,
  ResetPasswordInput,
} from "@/features/auth/types/auth.types";

export interface AuthService {
  getSession(): AuthUser | null;
  getAccessToken(): string | null;
  restoreSession(): Promise<AuthUser | null>;
  login(credentials: LoginCredentials): Promise<AuthUser>;
  logout(): Promise<void>;
  /** Single-flight access-token refresh using the stored refresh token. */
  refreshTokens(): Promise<void>;
  /** Refresh only when the access token is near expiry (proactive). */
  ensureFreshAccessToken(): Promise<void>;
  /** Idempotent local teardown when refresh fails mid-session. */
  endExpiredSession(): void;
  /**
   * Apply an auth change that originated in another tab.
   * Tears down or restores local state without re-broadcasting or re-emitting.
   */
  applyRemoteAuthSync(type: "logout" | "session_expired" | "login"): AuthUser | null;
  getProfile(): Promise<AuthUser>;
  updateProfile(input: ProfileUpdateInput): Promise<AuthUser>;
  changePassword(input: ChangePasswordInput): Promise<void>;
  forgotPassword(input: ForgotPasswordInput): Promise<void>;
  resetPassword(input: ResetPasswordInput): Promise<void>;
}
