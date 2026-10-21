import type { ServiceErrorCode } from "@/shared/errors/error.types";

/**
 * i18n translation keys for service-layer errors.
 * Resolve with `useTranslation()` or `mapServiceErrorToMessageKey` + `t[key]`.
 */
export const SERVICE_ERROR_MESSAGE_KEYS: Record<ServiceErrorCode, string> = {
  invalid_credentials: "signInErrorDescription",
  invalid_email: "invalidEmail",
  network_error: "errorStateDefaultDescription",
  not_found: "pageNotFoundTitle",
  permission_denied: "crudPermissionDeniedDescription",
  request_timeout: "requestTimeoutDescription",
  session_expired: "sessionExpiredDescription",
  unknown: "errorStateDefaultDescription",
};
