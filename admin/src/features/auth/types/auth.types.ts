import type { FieldErrors } from "@/shared/types";

export type AuthRole = {
  id: number;
  name: string;
  permissions: string[];
};

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  phoneNumber?: string | null;
  role: string;
  roles: AuthRole[];
  avatarFileUrl?: string | null;
  gender?: "MALE" | "FEMALE" | null;
  genderLabel?: string | null;
  dateOfBirth?: string | null;
  verifiedAt?: string | null;
  createdAt?: string | null;
  active?: boolean;
};

export type AuthSession = {
  user: AuthUser;
  token: string;
  refreshToken: string;
  /** Client clock when the current access token was stored (fallback if JWT has no `exp`). */
  tokenIssuedAt?: number;
};

export type LoginCredentials = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export type LoginFieldErrors = FieldErrors<"email" | "password">;

export type ProfileUpdateInput = {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  gender?: "MALE" | "FEMALE";
  dateOfBirth?: string;
  avatar?: File | null;
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirmation: string;
};

export type ForgotPasswordInput = {
  email: string;
};

export type ResetPasswordInput = {
  email: string;
  password: string;
  passwordConfirmation: string;
  token: string;
};
