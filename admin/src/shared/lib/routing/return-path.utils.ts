export type ReturnLocationState = {
  from?: {
    pathname?: string;
    search?: string;
    hash?: string;
  };
};

const LOGIN_PATH = "/login";
const PROBE_ORIGIN = "https://return-path.invalid";

/** Resolve like a browser would (which also strips tabs/newlines) and require the same origin. */
function staysOnOrigin(target: string): boolean {
  try {
    return new URL(target, PROBE_ORIGIN).origin === PROBE_ORIGIN;
  } catch {
    return false;
  }
}

/**
 * Builds the in-app path to return to after auth. Only same-origin absolute
 * paths are allowed; "//host", "/\host" and variants hidden by tabs/newlines
 * (e.g. "/\t/host") are rejected because browsers resolve them to another origin.
 */
export function resolveReturnPath(state: ReturnLocationState | null, fallback: string): string {
  const pathname = state?.from?.pathname;
  if (
    typeof pathname !== "string" ||
    !pathname.startsWith("/") ||
    pathname.startsWith("//") ||
    pathname.startsWith("/\\") ||
    pathname === LOGIN_PATH
  ) {
    return fallback;
  }

  const search = typeof state?.from?.search === "string" ? state.from.search : "";
  const hash = typeof state?.from?.hash === "string" ? state.from.hash : "";
  const target = `${pathname}${search}${hash}`;
  return staysOnOrigin(target) ? target : fallback;
}
