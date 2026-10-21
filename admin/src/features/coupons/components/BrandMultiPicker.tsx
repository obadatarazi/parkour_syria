import { Check, ChevronDown, X } from "lucide-react";
import { useEffect, useId, useState } from "react";

import type { Brand } from "@/features/brands/types/brands.types";
import {
  getBrandMultiLabel,
  useBrandMultiPicker,
} from "@/features/coupons/hooks/use-brand-multi-picker";
import { RelationPickerPanel } from "@/features/products/components/RelationPickerPanel";
import type { RelationPickerSeed } from "@/features/products/types/products.types";
import { FormField } from "@/shared/components";
import { Button } from "@/shared/design-system/components/ui/button";
import { Input } from "@/shared/design-system/components/ui/input";
import { cn } from "@/shared/design-system/components/ui/utils";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";

type BrandMultiPickerProps = {
  value: number[];
  seedItems?: RelationPickerSeed[];
  onChange: (brandIds: number[]) => void;
  disabled?: boolean;
  error?: string;
  required?: boolean;
};

function brandToSeed(brand: Brand): RelationPickerSeed {
  return {
    id: brand.id,
    title: brand.title,
    ...(brand.translations ? { translations: brand.translations } : {}),
  };
}

export function BrandMultiPicker({
  value,
  seedItems = [],
  onChange,
  disabled = false,
  error,
  required = true,
}: BrandMultiPickerProps) {
  const t = useTranslation();
  const fieldId = useId();
  const panelId = `${fieldId}-panel`;
  const [isOpen, setIsOpen] = useState(false);
  const [pickedItems, setPickedItems] = useState<RelationPickerSeed[]>([]);
  const seedKey = seedItems.map((item) => item.id).join(",");

  useEffect(() => {
    setPickedItems([]);
  }, [seedKey]);

  const {
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    pageBrands,
    selectedBrands,
    isLoading,
    isError,
    error: queryError,
    refetch,
  } = useBrandMultiPicker({
    selectedIds: value,
    seedItems,
    pickedItems,
    enabled: !disabled,
    isOpen,
  });

  const toggleBrand = (brand: Brand) => {
    if (value.includes(brand.id)) {
      onChange(value.filter((id) => id !== brand.id));
      return;
    }
    setPickedItems((current) => [...current.filter((item) => item.id !== brand.id), brandToSeed(brand)]);
    onChange([...value, brand.id]);
  };

  return (
    <FormField label={t.brands} fieldId={fieldId} error={error} required={required}>
      <div className="space-y-3">
        {selectedBrands.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedBrands.map((brand) => (
              <span
                key={brand.id}
                className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1 text-xs"
              >
                {getBrandMultiLabel(brand)}
                {!disabled ? (
                  <button type="button" className="rounded p-0.5 hover:bg-muted" onClick={() => toggleBrand(brand)}>
                    <X className="size-3" />
                  </button>
                ) : null}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t.selectBrands}</p>
        )}

        <Button
          type="button"
          variant="outline"
          className="w-full justify-between"
          onClick={() => setIsOpen((current) => !current)}
          disabled={disabled}
          aria-expanded={isOpen}
          aria-controls={panelId}
        >
          <span>{isOpen ? t.closePicker : t.selectBrands}</span>
          <ChevronDown className={cn("size-4 transition-transform", isOpen && "rotate-180")} />
        </Button>

        {isOpen ? (
          <RelationPickerPanel panelId={panelId} onClose={() => setIsOpen(false)} selectedCount={value.length}>
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t.search}
              disabled={disabled}
            />
            {isLoading && pageBrands.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.loadingMessage}</p>
            ) : isError ? (
              <div className="space-y-2">
                <p className="text-sm text-destructive">{resolveServiceErrorMessage(queryError, t)}</p>
                <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
                  {t.tryAgain}
                </Button>
              </div>
            ) : pageBrands.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.noData}</p>
            ) : (
              <div className="max-h-52 space-y-1 overflow-y-auto">
                {pageBrands.map((brand) => {
                  const isSelected = value.includes(brand.id);
                  return (
                    <button
                      key={brand.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => toggleBrand(brand)}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-start text-sm",
                        isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted/60",
                      )}
                    >
                      <span className="truncate">{getBrandMultiLabel(brand)}</span>
                      {isSelected ? <Check className="size-4 shrink-0" /> : null}
                    </button>
                  );
                })}
              </div>
            )}
            {totalPages > 1 ? (
              <div className="flex items-center justify-between gap-2">
                <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  {t.previous}
                </Button>
                <span className="text-xs text-muted-foreground">
                  {page} / {totalPages}
                </span>
                <Button type="button" variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                  {t.nextPage}
                </Button>
              </div>
            ) : null}
          </RelationPickerPanel>
        ) : null}
      </div>
    </FormField>
  );
}
