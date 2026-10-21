export type ValidationResult<TFields extends string = string> = {
  isValid: boolean;
  errors: Partial<Record<TFields, string>>;
};

export type FieldErrors<TFields extends string = string> = Partial<Record<TFields, string>>;
