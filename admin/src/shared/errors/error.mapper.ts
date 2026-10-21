import { SERVICE_ERROR_MESSAGE_KEYS } from "@/shared/errors/error.messages";
import { getServiceErrorCode } from "@/shared/errors/error.utils";

/**
 * Maps any thrown value to an i18n translation key for user-facing error messages.
 */
export function mapServiceErrorToMessageKey(error: unknown): string {
  const code = getServiceErrorCode(error);
  return SERVICE_ERROR_MESSAGE_KEYS[code];
}
