import { type TextareaHTMLAttributes, useId } from "react";

import { getFormFieldDescribedBy } from "@/shared/components/forms/form-field.utils";
import { FormField } from "@/shared/components/forms/FormField";
import { Textarea } from "@/shared/design-system/components/ui/textarea";
import { cn } from "@/shared/design-system/components/ui/utils";

export type TextAreaFieldProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> & {
  label: string;
  helperText?: string;
  error?: string;
  containerClassName?: string;
};

export function TextAreaField({
  label,
  helperText,
  error,
  className,
  containerClassName,
  required,
  rows = 4,
  ...props
}: TextAreaFieldProps) {
  const id = useId();

  return (
    <FormField
      label={label}
      fieldId={id}
      required={required}
      helperText={helperText}
      error={error}
      containerClassName={containerClassName}
    >
      <Textarea
        id={id}
        rows={rows}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={getFormFieldDescribedBy(id, { error, helperText })}
        className={cn(className)}
        {...props}
      />
    </FormField>
  );
}
