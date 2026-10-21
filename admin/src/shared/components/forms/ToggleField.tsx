import { useId } from "react";

import { ErrorText } from "@/shared/components/typography/Typography";
import { Label } from "@/shared/design-system/components/ui/label";
import { Switch } from "@/shared/design-system/components/ui/switch";
import { cn } from "@/shared/design-system/components/ui/utils";

export type ToggleFieldProps = {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  description?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
};

export function ToggleField({
  label,
  checked,
  onCheckedChange,
  description,
  error,
  disabled,
  className,
  id: idProp,
}: ToggleFieldProps) {
  const generatedId = useId();
  const switchId = idProp ?? generatedId;
  const labelId = `${switchId}-label`;
  const descriptionId = description ? `${switchId}-description` : undefined;
  const errorId = error ? `${switchId}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  const toggle = () => {
    if (!disabled) onCheckedChange(!checked);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn("flex items-center justify-between gap-4", !disabled && "cursor-pointer")}
        onClick={toggle}
      >
        <div className="min-w-0 space-y-1">
          <Label id={labelId} className="cursor-pointer text-sm font-medium text-foreground">
            {label}
          </Label>
          {description ? (
            <p id={descriptionId} className="text-xs text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        <Switch
          id={switchId}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          aria-labelledby={labelId}
          aria-describedby={describedBy}
        />
      </div>
      {error ? <ErrorText id={errorId}>{error}</ErrorText> : null}
    </div>
  );
}
