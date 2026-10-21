import { type ReactNode } from "react";

import { ErrorText, HelperText } from "@/shared/components/typography/Typography";
import { Label } from "@/shared/design-system/components/ui/label";
import { cn } from "@/shared/design-system/components/ui/utils";

import { RequiredIndicator } from "./RequiredIndicator";

export type FormFieldProps = {
  label: string;
  fieldId: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  children: ReactNode;
  containerClassName?: string;
  labelClassName?: string;
};

export function FormField({
  label,
  fieldId,
  required,
  helperText,
  error,
  children,
  containerClassName,
  labelClassName,
}: FormFieldProps) {
  const helperId = `${fieldId}-helper`;
  const errorId = `${fieldId}-error`;

  return (
    <div className={cn("flex flex-col gap-2", containerClassName)}>
      <Label htmlFor={fieldId} className={cn("text-sm font-medium text-foreground", labelClassName)}>
        {label}
        {required ? <RequiredIndicator /> : null}
      </Label>
      {children}
      {error ? <ErrorText id={errorId}>{error}</ErrorText> : null}
      {!error && helperText ? <HelperText id={helperId}>{helperText}</HelperText> : null}
    </div>
  );
}

