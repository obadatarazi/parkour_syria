/** True for E.164 / local digit strings (optional +, spaces, dashes, parentheses). */
export function looksLikePhoneNumber(value: string): boolean {
  const compact = value.replace(/[\s-().]/g, "");
  return /^\+?\d{6,15}$/.test(compact);
}
