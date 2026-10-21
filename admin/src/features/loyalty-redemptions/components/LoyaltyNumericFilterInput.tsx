import { CRUD_FILTER_ALL_VALUE } from "@/shared/crud/constants/crud.constants";
import { cn } from "@/shared/design-system/components/ui/utils";

type LoyaltyNumericFilterInputProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function LoyaltyNumericFilterInput({
  id,
  label,
  value,
  onChange,
  className,
}: LoyaltyNumericFilterInputProps) {
  const displayValue = value === CRUD_FILTER_ALL_VALUE ? "" : value;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <label htmlFor={id} className="shrink-0 text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <input
        id={id}
        type="number"
        min={1}
        inputMode="numeric"
        value={displayValue}
        onChange={(event) => {
          const next = event.target.value.trim();
          onChange(next ? next : CRUD_FILTER_ALL_VALUE);
        }}
        className="h-8 w-[6.5rem] rounded-xl border border-border bg-background px-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
        aria-label={label}
      />
    </div>
  );
}
