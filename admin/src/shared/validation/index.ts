export { VALIDATION_MESSAGE_KEYS, type ValidationMessageKey } from "@/shared/validation/validation.messages";
export type { FieldErrors, ValidationResult } from "@/shared/validation/validation.types";
export {
  clearFieldError,
  createValidationResult,
  isValidEmail,
  mergeFieldErrors,
  validateEmail,
  validateRequired,
} from "@/shared/validation/validation.utils";
