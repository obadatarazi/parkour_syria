const UNSAFE_ERROR_MESSAGE =
  /sqlstate|stack\s*trace|exception|vendor[\\/]|\.php\b|pdoexception|syntax error|call to |on null|on array|cannot read propert|failed to fetch|dynamically imported|importing a module script|loading chunk |unable to preload|is not a function|is not defined|econn|enotfound|getaddrinfo|unexpected token|whoops|errno|allowed memory|maximum execution time|undefined (array|offset|index|variable|property)/i;

/** True when a message is a runtime, database, or transport detail rather than copy for an admin. */
export function isUnsafeErrorMessage(message: string): boolean {
  const normalized = message.trim();
  if (!normalized || normalized.length > 300) {
    return true;
  }

  if (/[<>]/.test(normalized)) {
    return true;
  }

  if (normalized.includes("\\")) {
    return true;
  }

  return UNSAFE_ERROR_MESSAGE.test(normalized);
}
