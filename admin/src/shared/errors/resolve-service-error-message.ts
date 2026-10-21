import type { Translation } from "@/shared/design-system/localization/locales/en";
import { SERVICE_ERROR_MESSAGE_KEYS } from "@/shared/errors/error.messages";
import { isServiceError } from "@/shared/errors/error.utils";
import { isUnsafeErrorMessage } from "@/shared/errors/is-unsafe-error-message";

/**
 * Resolves a user-facing error message from API/service errors and i18n fallbacks.
 * Runtime and database details stay off the screen.
 */
export function resolveServiceErrorMessage(error: unknown, t: Translation): string {
  if (isServiceError(error)) {
    const message = error.message.trim();
    if (message && message !== error.code && !isUnsafeErrorMessage(message)) {
      return message;
    }

    const messageKey = SERVICE_ERROR_MESSAGE_KEYS[error.code];
    const translated = t[messageKey as keyof Translation];
    if (typeof translated === "string") {
      return translated;
    }
  }

  return t.errorStateDefaultDescription;
}
