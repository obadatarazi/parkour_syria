import { Check, Loader2, Search, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import {
  getOrderDeliveryZoneLabel,
  useOrderDeliveryZonePicker,
} from "@/features/orders/hooks/use-order-delivery-zone-picker";
import type { DeliveryZonesPrice } from "@/features/delivery-zones-prices/types/delivery-zones-prices.types";
import { AppButton, FormField } from "@/shared/components";
import { Button } from "@/shared/design-system/components/ui/button";
import { Input } from "@/shared/design-system/components/ui/input";
import { cn } from "@/shared/design-system/components/ui/utils";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";

type OrderDeliveryZonePickerProps = {
  value: number | null;
  onSelect: (zone: DeliveryZonesPrice) => void;
  onClear: () => void;
  disabled?: boolean;
  error?: string;
  required?: boolean;
};

export function OrderDeliveryZonePicker({
  value,
  onSelect,
  onClear,
  disabled = false,
  error,
  required = false,
}: OrderDeliveryZonePickerProps) {
  const t = useTranslation();
  const fieldId = useId();
  const panelId = `${fieldId}-panel`;
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const {
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    zones,
    selectedZone,
    isLoading,
    isError,
    error: queryError,
    refetch,
  } = useOrderDeliveryZonePicker({
    selectedId: value,
    enabled: !disabled,
    active: isOpen,
  });

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen]);

  const handleClear = () => {
    onClear();
    setSearch("");
    setIsOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleSelect = (zone: DeliveryZonesPrice) => {
    onSelect(zone);
    setSearch("");
    setIsOpen(false);
  };

  return (
    <FormField
      label={t.deliveryZonesPrices}
      fieldId={fieldId}
      error={error}
      required={required}
    >
      <div ref={rootRef} className={cn("relative space-y-1", isOpen && "pb-2")}>
        {selectedZone && !isOpen ? (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {getOrderDeliveryZoneLabel(selectedZone)}
              </p>
            </div>
            <AppButton
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={() => {
                setIsOpen(true);
                setSearch("");
                requestAnimationFrame(() => inputRef.current?.focus());
              }}
            >
              {t.change}
            </AppButton>
            <AppButton
              type="button"
              variant="ghost"
              size="icon"
              disabled={disabled}
              aria-label={t.clearSelection}
              onClick={handleClear}
            >
              <X className="size-4" aria-hidden="true" />
            </AppButton>
          </div>
        ) : (
          <div className="relative">
            <Search
              className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              ref={inputRef}
              id={fieldId}
              value={search}
              disabled={disabled}
              autoComplete="off"
              placeholder={t.deliveryZoneSearchPlaceholder}
              aria-expanded={isOpen}
              aria-controls={panelId}
              aria-autocomplete="list"
              role="combobox"
              className="pe-9 ps-9"
              onFocus={() => setIsOpen(true)}
              onChange={(event) => {
                setSearch(event.target.value);
                setIsOpen(true);
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setIsOpen(false);
                  inputRef.current?.blur();
                }
              }}
            />
            {isLoading ? (
              <Loader2
                className="absolute end-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
                aria-hidden="true"
              />
            ) : search ? (
              <button
                type="button"
                className="absolute end-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label={t.clearSelection}
                disabled={disabled}
                onClick={() => {
                  setSearch("");
                  inputRef.current?.focus();
                }}
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        )}

        {isOpen ? (
          <div
            id={panelId}
            role="listbox"
            className="relative z-10 mt-2 mb-3 w-full overflow-hidden rounded-xl border border-border bg-popover shadow-md"
          >
            <div className="max-h-56 overflow-y-auto p-1">
              {isLoading && zones.length === 0 ? (
                <p className="px-3 py-4 text-sm text-muted-foreground">{t.loadingMessage}</p>
              ) : isError ? (
                <div className="space-y-2 px-3 py-3">
                  <p className="text-sm text-destructive">
                    {resolveServiceErrorMessage(queryError, t)}
                  </p>
                  <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
                    {t.tryAgain}
                  </Button>
                </div>
              ) : zones.length === 0 ? (
                <p className="px-3 py-4 text-sm text-muted-foreground">
                  {search.trim() ? t.noData : t.deliveryZoneSearchPlaceholder}
                </p>
              ) : (
                zones.map((zone) => {
                  const label = getOrderDeliveryZoneLabel(zone);
                  const isSelected = value === zone.id;

                  return (
                    <button
                      key={zone.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      disabled={disabled}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => handleSelect(zone)}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-start text-sm transition-colors",
                        isSelected
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted/60",
                      )}
                    >
                      <span className="min-w-0 truncate font-medium">{label}</span>
                      {isSelected ? <Check className="size-4 shrink-0" /> : null}
                    </button>
                  );
                })
              )}
            </div>

            {totalPages > 1 ? (
              <div className="flex items-center justify-between gap-2 border-t border-border px-2 py-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled || page <= 1 || isLoading}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  {t.previous}
                </Button>
                <span className="text-xs text-muted-foreground">
                  {page} / {totalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled || page >= totalPages || isLoading}
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                >
                  {t.next}
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </FormField>
  );
}
