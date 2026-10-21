import { Check, ChevronDown, Search } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";

import { FormField } from "@/shared/components/forms/FormField";
import type { SelectFieldOption } from "@/shared/components/forms/SelectField";
import { Input } from "@/shared/design-system/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/design-system/components/ui/popover";
import { cn } from "@/shared/design-system/components/ui/utils";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type SearchableSelectFieldProps = {
  label: string;
  value: string;
  options: SelectFieldOption[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  searchPlaceholder?: string;
};

export function SearchableSelectField({
  label,
  value,
  options,
  onValueChange,
  placeholder,
  disabled = false,
  searchPlaceholder,
}: SearchableSelectFieldProps) {
  const t = useTranslation();
  const fieldId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? placeholder ?? t.filterAll;

  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return options;
    return options.filter((option) => option.label.toLowerCase().includes(normalized));
  }, [options, query]);

  return (
    <FormField label={label} fieldId={fieldId}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            id={fieldId}
            type="button"
            disabled={disabled}
            aria-expanded={open}
            className={cn(
              "border-input flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-input-background px-3 py-2 text-start text-sm transition-[color,box-shadow] outline-none",
              "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
              "disabled:cursor-not-allowed disabled:opacity-50",
              !value ? "text-muted-foreground" : "text-foreground",
            )}
          >
            <span className="min-w-0 truncate">{selectedLabel}</span>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <div className="border-b border-border/60 p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute start-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder ?? t.search}
                disabled={disabled}
                className="h-8 ps-7 text-xs"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <p className="px-2 py-3 text-center text-xs text-muted-foreground">{t.noData}</p>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    disabled={option.disabled}
                    onClick={() => {
                      onValueChange(option.value);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-start text-sm",
                      isSelected
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted/60",
                      option.disabled && "pointer-events-none opacity-50",
                    )}
                  >
                    <span className="min-w-0 truncate">{option.label}</span>
                    {isSelected ? <Check className="size-4 shrink-0" aria-hidden="true" /> : null}
                  </button>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>
    </FormField>
  );
}
