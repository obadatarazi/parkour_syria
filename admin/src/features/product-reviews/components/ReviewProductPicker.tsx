import { Check, ChevronDown, X } from "lucide-react";
import { useEffect, useId, useState } from "react";

import {
  getProductLabel,
  useProductPicker,
} from "@/features/product-reviews/hooks/use-product-picker";
import { ProductPickerCatalogFilters } from "@/features/products/components/ProductPickerCatalogFilters";
import { RelationPickerPanel } from "@/features/products/components/RelationPickerPanel";
import { useProductPickerCatalogFilters } from "@/features/products/hooks/use-product-picker-catalog-filters";
import type { Product } from "@/features/products/types/products.types";
import { FormField } from "@/shared/components";
import { Button } from "@/shared/design-system/components/ui/button";
import { Input } from "@/shared/design-system/components/ui/input";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { cn } from "@/shared/design-system/components/ui/utils";

type ReviewProductPickerProps = {
  value: number | null;
  onChange: (productId: number | null) => void;
  disabled?: boolean;
  error?: string;
};

export function ReviewProductPicker({
  value,
  onChange,
  disabled = false,
  error,
}: ReviewProductPickerProps) {
  const t = useTranslation();
  const fieldId = useId();
  const panelId = `${fieldId}-panel`;
  const [isOpen, setIsOpen] = useState(false);
  const [pickedProduct, setPickedProduct] = useState<Product | null>(null);
  const {
    brandId,
    categoryId,
    brandFilter,
    categoryFilter,
    setBrandFilter,
    setCategoryFilter,
  } = useProductPickerCatalogFilters();
  const {
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    pageProducts,
    selectedProduct,
    isLoading,
    isSelectedLoading,
    isError,
    error: queryError,
    refetch,
  } = useProductPicker({
    selectedId: value,
    enabled: !disabled,
    isOpen,
    brandId,
    categoryId,
  });

  useEffect(() => {
    if (value == null) {
      setPickedProduct(null);
    }
  }, [value]);

  const resolvedProduct =
    selectedProduct ?? (pickedProduct?.id === value ? pickedProduct : null);
  const selectedLabel = resolvedProduct ? getProductLabel(resolvedProduct) : null;
  const closePanel = () => setIsOpen(false);

  return (
    <FormField label={t.product} fieldId={fieldId} error={error} required>
      <div className="space-y-3">
        {value != null ? (
          <div className="flex items-center gap-2">
            <span className="inline-flex min-w-0 flex-1 items-center rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-sm text-foreground">
              <span className="truncate">
                {selectedLabel ?? (isSelectedLoading ? t.loadingMessage : `#${value}`)}
              </span>
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
          <p className="text-sm text-muted-foreground">{t.selectProduct}</p>
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
          <span>{isOpen ? t.closePicker : t.selectProduct}</span>
          <ChevronDown className={cn("size-4 transition-transform", isOpen && "rotate-180")} />
        </Button>

        {isOpen ? (
          <RelationPickerPanel
            panelId={panelId}
            onClose={closePanel}
            selectedCount={value != null ? 1 : 0}
          >
            <ProductPickerCatalogFilters
              brandFilter={brandFilter}
              categoryFilter={categoryFilter}
              onBrandFilterChange={setBrandFilter}
              onCategoryFilterChange={setCategoryFilter}
              disabled={disabled}
              showHint
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t.productSearchPlaceholder}
              disabled={disabled}
              aria-label={t.productSearchPlaceholder}
            />

            {isLoading && pageProducts.length === 0 ? (
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
            ) : pageProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.noProductsFound}</p>
            ) : (
              <div className="max-h-52 space-y-1 overflow-y-auto">
                {pageProducts.map((product: Product) => {
                  const label = getProductLabel(product);
                  const isSelected = value === product.id;

                  return (
                    <button
                      key={product.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        setPickedProduct(product);
                        onChange(product.id);
                        closePanel();
                      }}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-start text-sm transition-colors",
                        isSelected
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted/60",
                      )}
                    >
                      <span className="min-w-0 truncate">{label}</span>
                      {isSelected ? <Check className="size-4 shrink-0" aria-hidden="true" /> : null}
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
