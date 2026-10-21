/**
 * i18n translation keys for common validation messages.
 * Resolve with `useTranslation()` in hooks and components.
 */
export const VALIDATION_MESSAGE_KEYS = {
  required: "required",
  invalidEmail: "invalidEmail",
} as const;

export type ValidationMessageKey =
  (typeof VALIDATION_MESSAGE_KEYS)[keyof typeof VALIDATION_MESSAGE_KEYS];
