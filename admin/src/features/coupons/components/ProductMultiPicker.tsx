import { Check, ChevronDown, X } from "lucide-react";
import { useEffect, useId, useState } from "react";

import {
  getProductMultiLabel,
  useProductMultiPicker,
} from "@/features/coupons/hooks/use-product-multi-picker";
import { ProductPickerCatalogFilters } from "@/features/products/components/ProductPickerCatalogFilters";
import { RelationPickerPanel } from "@/features/products/components/RelationPickerPanel";
import { useProductPickerCatalogFilters } from "@/features/products/hooks/use-product-picker-catalog-filters";
import type { Product, RelationPickerSeed } from "@/features/products/types/products.types";
import { FormField } from "@/shared/components";
import { Button } from "@/shared/design-system/components/ui/button";
import { Input } from "@/shared/design-system/components/ui/input";
import { cn } from "@/shared/design-system/components/ui/utils";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";

type ProductMultiPickerProps = {
  value: number[];
  seedItems?: RelationPickerSeed[];
  onChange: (productIds: number[]) => void;
  disabled?: boolean;
  error?: string;
};

function productToSeed(product: Product): RelationPickerSeed {
  return {
    id: product.id,
    title: product.title,
    ...(product.translations ? { translations: product.translations } : {}),
  };
}

export function ProductMultiPicker({
  value,
  seedItems = [],
  onChange,
  disabled = false,
  error,
}: ProductMultiPickerProps) {
  const t = useTranslation();
  const fieldId = useId();
  const panelId = `${fieldId}-panel`;
  const [isOpen, setIsOpen] = useState(false);
  const [pickedItems, setPickedItems] = useState<RelationPickerSeed[]>([]);
  const {
    brandId,
    categoryId,
    brandFilter,
    categoryFilter,
    setBrandFilter,
    setCategoryFilter,
  } = useProductPickerCatalogFilters();
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
    pageProducts,
    selectedProducts,
    isLoading,
    isError,
    error: queryError,
    refetch,
  } = useProductMultiPicker({
    selectedIds: value,
    seedItems,
    pickedItems,
    enabled: !disabled,
    isOpen,
    brandId,
    categoryId,
  });

  const toggleProduct = (product: Product) => {
    if (value.includes(product.id)) {
      onChange(value.filter((id) => id !== product.id));
      return;
    }
    setPickedItems((current) => [
      ...current.filter((item) => item.id !== product.id),
      productToSeed(product),
    ]);
    onChange([...value, product.id]);
  };

  return (
    <FormField label={t.products} fieldId={fieldId} error={error} required>
      <div className="space-y-3">
        {selectedProducts.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedProducts.map((product) => (
              <span
                key={product.id}
                className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1 text-xs"
              >
                {getProductMultiLabel(product)}
                {!disabled ? (
                  <button
                    type="button"
                    className="rounded p-0.5 hover:bg-muted"
                    onClick={() => toggleProduct(product)}
                  >
                    <X className="size-3" />
                  </button>
                ) : null}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t.selectProducts}</p>
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
          <span>{isOpen ? t.closePicker : t.selectProducts}</span>
          <ChevronDown className={cn("size-4 transition-transform", isOpen && "rotate-180")} />
        </Button>

        {isOpen ? (
          <RelationPickerPanel panelId={panelId} onClose={() => setIsOpen(false)} selectedCount={value.length}>
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
              placeholder={t.search}
              disabled={disabled}
            />
            {isLoading && pageProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.loadingMessage}</p>
            ) : isError ? (
              <div className="space-y-2">
                <p className="text-sm text-destructive">{resolveServiceErrorMessage(queryError, t)}</p>
                <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
                  {t.tryAgain}
                </Button>
              </div>
            ) : pageProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.noData}</p>
            ) : (
              <div className="max-h-52 space-y-1 overflow-y-auto">
                {pageProducts.map((product) => {
                  const isSelected = value.includes(product.id);
                  return (
                    <button
                      key={product.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => toggleProduct(product)}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-start text-sm",
                        isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted/60",
                      )}
                    >
                      <span className="truncate">{getProductMultiLabel(product)}</span>
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
