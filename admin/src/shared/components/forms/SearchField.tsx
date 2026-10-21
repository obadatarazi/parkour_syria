import { Search, X } from "lucide-react";

import { AppButton } from "@/shared/components/buttons/AppButton";
import { Input } from "@/shared/design-system/components/ui/input";
import { cn } from "@/shared/design-system/components/ui/utils";

export type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onReset?: () => void;
  placeholder: string;
  ariaLabel: string;
  clearAriaLabel?: string;
  className?: string;
  inputClassName?: string;
  fullWidth?: boolean;
};

export function SearchField({
  value,
  onChange,
  onReset,
  placeholder,
  ariaLabel,
  clearAriaLabel,
  className,
  inputClassName,
  fullWidth = false,
}: SearchFieldProps) {
  const handleClear = () => {
    if (onReset) {
      onReset();
      return;
    }
    onChange("");
  };

  return (
    <div className={cn("relative", fullWidth ? "w-full" : "w-full max-w-xs", className)}>
      <Search
        className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={cn("pe-9 ps-9", inputClassName)}
      />
      {value ? (
        <AppButton
          type="button"
          variant="ghost"
          size="icon"
          className="absolute end-1 top-1/2 size-7 -translate-y-1/2"
          onClick={handleClear}
          aria-label={clearAriaLabel ?? ariaLabel}
        >
          <X className="size-3.5" aria-hidden="true" />
        </AppButton>
      ) : null}
    </div>
  );
}
