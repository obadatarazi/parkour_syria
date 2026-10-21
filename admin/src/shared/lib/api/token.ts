import { AUTH_STORAGE_KEY } from "@/shared/constants/auth";

type StoredTokens = { token?: string; tokenIssuedAt?: number };

function readStoredTokens(): StoredTokens | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredTokens;
  } catch {
    return null;
  }
}

export function readAccessToken(): string | null {
  return readStoredTokens()?.token ?? null;
}

/** When the stored access token was issued (ms), the fallback expiry for tokens without `exp`. */
export function readTokenIssuedAt(): number | undefined {
  return readStoredTokens()?.tokenIssuedAt;
}
