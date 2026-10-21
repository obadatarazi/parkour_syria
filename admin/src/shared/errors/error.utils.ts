import { ServiceError, type ServiceErrorCode } from "@/shared/errors/error.types";

export function isServiceError(error: unknown): error is ServiceError {
  return error instanceof ServiceError;
}

export function getServiceErrorCode(error: unknown): ServiceErrorCode {
  if (isServiceError(error)) return error.code;
  return "unknown";
}

export function toError(error: unknown, fallbackMessage = "Unknown error"): Error {
  if (error instanceof Error) return error;
  if (typeof error === "string") return new Error(error);
  return new Error(fallbackMessage);
}
