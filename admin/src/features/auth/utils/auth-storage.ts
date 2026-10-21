import { AUTH_STORAGE_KEY } from "@/features/auth/constants/auth.constants";
import type { AuthSession, AuthUser } from "@/features/auth/types/auth.types";

export function readStoredSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed.user || !parsed.token) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function readStoredUser(): AuthUser | null {
  return readStoredSession()?.user ?? null;
}

export function readStoredToken(): string | null {
  return readStoredSession()?.token ?? null;
}

export function writeStoredSession(session: AuthSession): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredSession(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}
