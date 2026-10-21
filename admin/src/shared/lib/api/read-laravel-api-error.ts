export interface LaravelApiErrorPayload {
  success?: boolean;
  error?: unknown;
  message?: unknown;
  code?: unknown;
  errors?: unknown;
}

function readStringValue(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  return undefined;
}

function readFirstStringFromArray(value: unknown): string | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  for (const item of value) {
    const message = readStringValue(item);
    if (message) {
      return message;
    }
  }

  return undefined;
}

/** Read the first validation message from Laravel `{ errors: { field: ["..."] } }`. */
export function readFirstLaravelValidationError(errors: unknown): string | undefined {
  if (!errors || typeof errors !== "object") {
    return undefined;
  }

  for (const value of Object.values(errors as Record<string, unknown>)) {
    const direct = readStringValue(value);
    if (direct) {
      return direct;
    }

    const fromArray = readFirstStringFromArray(value);
    if (fromArray) {
      return fromArray;
    }
  }

  return undefined;
}

/** Read a human-readable message from common Laravel API error payloads. */
export function readLaravelApiErrorMessage(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") {
    return undefined;
  }

  const body = payload as LaravelApiErrorPayload;

  const directError = readStringValue(body.error);
  if (directError) {
    return directError;
  }

  const errorFromArray = readFirstStringFromArray(body.error);
  if (errorFromArray) {
    return errorFromArray;
  }

  const directMessage = readStringValue(body.message);
  if (directMessage) {
    return directMessage;
  }

  return readFirstLaravelValidationError(body.errors);
}
