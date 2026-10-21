import { useId } from "react";

import { ErrorText } from "@/shared/components/typography/Typography";
import { Checkbox } from "@/shared/design-system/components/ui/checkbox";
import { Label } from "@/shared/design-system/components/ui/label";
import { cn } from "@/shared/design-system/components/ui/utils";

export type CheckboxFieldProps = {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
};

export function CheckboxField({
  label,
  checked,
  onCheckedChange,
  error,
  disabled,
  className,
  id: idProp,
}: CheckboxFieldProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const errorId = `${id}-error`;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-start gap-2">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={(value) => onCheckedChange(value === true)}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
        />
        <Label htmlFor={id} className="text-sm font-normal text-muted-foreground leading-snug">
          {label}
        </Label>
      </div>
      {error ? <ErrorText id={errorId}>{error}</ErrorText> : null}
    </div>
  );
}
