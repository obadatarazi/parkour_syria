import { Switch } from "@/shared/design-system/components/ui/switch";
import { cn } from "@/shared/design-system/components/ui/utils";

type CrudTableToggleProps = {
  checked: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  ariaLabel: string;
  onCheckedChange: (checked: boolean) => void;
};

export function CrudTableToggle({
  checked,
  disabled = false,
  isLoading = false,
  ariaLabel,
  onCheckedChange,
}: CrudTableToggleProps) {
  return (
    <div className="flex items-center justify-center">
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled || isLoading}
        aria-label={ariaLabel}
        className={cn(isLoading && "opacity-60")}
      />
    </div>
  );
}
