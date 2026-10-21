export type ServiceErrorCode =
  | "invalid_credentials"
  | "invalid_email"
  | "network_error"
  | "not_found"
  | "permission_denied"
  | "request_timeout"
  | "session_expired"
  | "unknown";

export class ServiceError extends Error {
  readonly code: ServiceErrorCode;

  constructor(code: ServiceErrorCode, message?: string) {
    super(message ?? code);
    this.name = "ServiceError";
    this.code = code;
  }
}
