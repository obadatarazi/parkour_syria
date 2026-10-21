/** Refresh this many ms before the access token expires. */
export const ACCESS_TOKEN_REFRESH_SKEW_MS = 2 * 60 * 1000;

/**
 * When the JWT has no `exp` (legacy tokens), treat `tokenIssuedAt + this` as the
 * refresh deadline. Matches Backend `Passport::personalAccessTokensExpireIn(1h)`
 * minus skew.
 */
export const FALLBACK_ACCESS_TOKEN_TTL_MS = 55 * 60 * 1000;

type JwtPayload = {
  exp?: number;
};

function decodeBase64UrlJson(segment: string): unknown {
  const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  return JSON.parse(atob(padded)) as unknown;
}

/** Reads JWT `exp` (ms since epoch) without verifying the signature. */
export function getAccessTokenExpiryMs(accessToken: string): number | null {
  const parts = accessToken.split(".");
  if (parts.length < 2 || !parts[1]) {
    return null;
  }

  try {
    const payload = decodeBase64UrlJson(parts[1]) as JwtPayload;
    if (typeof payload.exp !== "number" || !Number.isFinite(payload.exp)) {
      return null;
    }
    return payload.exp * 1000;
  } catch {
    return null;
  }
}

export function isAccessTokenNearingExpiry(
  accessToken: string,
  options?: {
    issuedAtMs?: number | null;
    skewMs?: number;
    nowMs?: number;
  },
): boolean {
  const nowMs = options?.nowMs ?? Date.now();
  const skewMs = options?.skewMs ?? ACCESS_TOKEN_REFRESH_SKEW_MS;
  const expiryMs = getAccessTokenExpiryMs(accessToken);

  if (expiryMs != null) {
    return nowMs >= expiryMs - skewMs;
  }

  const issuedAtMs = options?.issuedAtMs;
  if (typeof issuedAtMs === "number" && Number.isFinite(issuedAtMs)) {
    return nowMs >= issuedAtMs + FALLBACK_ACCESS_TOKEN_TTL_MS;
  }

  return false;
}
