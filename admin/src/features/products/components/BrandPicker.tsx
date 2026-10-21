import { Check, ChevronDown, X } from "lucide-react";
import { useEffect, useId, useState } from "react";

import { getBrandLabel, useBrandPicker } from "@/features/products/hooks/use-brand-picker";
import { RelationPickerPanel } from "@/features/products/components/RelationPickerPanel";
import type { RelationPickerSeed } from "@/features/products/types/products.types";
import type { Brand } from "@/features/brands/types/brands.types";
import { FormField } from "@/shared/components";
import { Button } from "@/shared/design-system/components/ui/button";
import { Input } from "@/shared/design-system/components/ui/input";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { cn } from "@/shared/design-system/components/ui/utils";

type BrandPickerProps = {
  value: number | null;
  seedItem?: RelationPickerSeed | null;
  onChange: (brandId: number | null) => void;
  disabled?: boolean;
  error?: string;
};

function brandToSeed(brand: Brand): RelationPickerSeed {
  return {
    id: brand.id,
    title: brand.title,
    ...(brand.translations ? { translations: brand.translations } : {}),
  };
}

export function BrandPicker({
  value,
  seedItem = null,
  onChange,
  disabled = false,
  error,
}: BrandPickerProps) {
  const t = useTranslation();
  const fieldId = useId();
  const panelId = `${fieldId}-panel`;
  const [isOpen, setIsOpen] = useState(false);
  const [pickedItem, setPickedItem] = useState<RelationPickerSeed | null>(null);

  useEffect(() => {
    setPickedItem(null);
  }, [seedItem?.id]);

  const {
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    pageBrands,
    selectedBrand,
    isLoading,
    isError,
    error: queryError,
    refetch,
  } = useBrandPicker({ selectedId: value, seedItem, pickedItem, enabled: !disabled, isOpen });

  const selectedLabel = selectedBrand ? getBrandLabel(selectedBrand) : null;
  const closePanel = () => setIsOpen(false);

  return (
    <FormField label={t.brand} fieldId={fieldId} error={error} required>
      <div className="space-y-3">
        {value != null && selectedLabel ? (
          <div className="flex items-center gap-2">
            <span className="inline-flex min-w-0 flex-1 items-center rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-sm text-foreground">
              <span className="truncate">{selectedLabel}</span>
            </span>
            {!disabled ? (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => onChange(null)}
                aria-label={t.removeItem}
              >
                <X className="size-4" />
              </Button>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t.selectBrand}</p>
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
          <span>{isOpen ? t.closePicker : t.selectBrand}</span>
          <ChevronDown className={cn("size-4 transition-transform", isOpen && "rotate-180")} />
        </Button>

        {isOpen ? (
          <RelationPickerPanel
            panelId={panelId}
            onClose={closePanel}
            selectedCount={value != null ? 1 : 0}
          >
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
                <p className="text-sm text-destructive">
                  {resolveServiceErrorMessage(queryError, t)}
                </p>
                <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
                  {t.tryAgain}
                </Button>
              </div>
            ) : pageBrands.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.noData}</p>
            ) : (
              <div className="max-h-52 space-y-1 overflow-y-auto">
                {pageBrands.map((brand) => {
                  const label = getBrandLabel(brand);
                  const isSelected = value === brand.id;

                  return (
                    <button
                      key={brand.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        setPickedItem(brandToSeed(brand));
                        onChange(brand.id);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-start text-sm transition-colors",
                        isSelected
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted/60",
                      )}
                    >
                      <span className="min-w-0 truncate">{label}</span>
                      {isSelected ? <Check className="size-4 shrink-0" /> : null}
                    </button>
                  );
                })}
              </div>
            )}

            {totalPages > 1 ? (
              <div className="flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled || page <= 1}
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
                  disabled={disabled || page >= totalPages}
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                >
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
