import { type ReactNode, useId } from "react";

import { FormField, getFormFieldDescribedBy } from "@/shared/components/forms/FormField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/design-system/components/ui/select";
import { cn } from "@/shared/design-system/components/ui/utils";

export type SelectFieldOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type SelectFieldProps = {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: SelectFieldOption[];
  placeholder?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  containerClassName?: string;
  triggerClassName?: string;
  emptyContent?: ReactNode;
};

export function SelectField({
  label,
  value,
  onValueChange,
  options,
  placeholder,
  helperText,
  error,
  required,
  disabled,
  containerClassName,
  triggerClassName,
}: SelectFieldProps) {
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
      <Select value={value || undefined} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger
          id={id}
          className={cn("w-full", triggerClassName)}
          aria-invalid={Boolean(error)}
          aria-describedby={getFormFieldDescribedBy(id, { error, helperText })}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options
            .filter((option) => option.value !== "")
            .map((option) => (
              <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </FormField>
  );
}
