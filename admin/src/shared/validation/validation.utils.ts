import type { FieldErrors, ValidationResult } from "@/shared/validation/validation.types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function createValidationResult<TFields extends string = string>(
  errors: FieldErrors<TFields> = {},
): ValidationResult<TFields> {
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim());
}

export function validateRequired(value: string, message: string): string | undefined {
  return value.trim() ? undefined : message;
}

export function validateEmail(value: string, message: string): string | undefined {
  if (!value.trim()) return undefined;
  return isValidEmail(value) ? undefined : message;
}

export function mergeFieldErrors<TFields extends string>(
  current: FieldErrors<TFields>,
  field: TFields,
  error: string | undefined,
): FieldErrors<TFields> {
  if (!error) {
    const next = { ...current };
    delete next[field];
    return next;
  }
  return { ...current, [field]: error };
}

export function clearFieldError<TFields extends string>(
  errors: FieldErrors<TFields>,
  field: TFields,
): FieldErrors<TFields> {
  return mergeFieldErrors(errors, field, undefined);
}
