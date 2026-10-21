import { Check, Package, Search, X } from "lucide-react";
import { useEffect, useId, useState } from "react";

import {
  getProductMultiLabel,
  useProductMultiPicker,
} from "@/features/coupons/hooks/use-product-multi-picker";
import { ProductPickerCatalogFilters } from "@/features/products/components/ProductPickerCatalogFilters";
import { useProductPickerCatalogFilters } from "@/features/products/hooks/use-product-picker-catalog-filters";
import type { Product, RelationPickerSeed } from "@/features/products/types/products.types";
import { MediaImage } from "@/shared/components";
import { Button } from "@/shared/design-system/components/ui/button";
import { Input } from "@/shared/design-system/components/ui/input";
import { cn } from "@/shared/design-system/components/ui/utils";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";

type PrescriptionProductPickerProps = {
  value: number[];
  seedItems?: RelationPickerSeed[];
  seedImageUrls?: Record<number, string | null | undefined>;
  onChange: (productIds: number[]) => void;
  disabled?: boolean;
};

function productImageUrl(
  product: Pick<Product, "id"> & Partial<Pick<Product, "featuredImageUrl" | "images">>,
  seedImageUrls: Record<number, string | null | undefined>,
): string | null {
  return (
    product.featuredImageUrl?.trim() ||
    product.images?.find((image) => image.featured)?.imageFileUrl ||
    product.images?.[0]?.imageFileUrl ||
    seedImageUrls[product.id] ||
    null
  );
}

function ProductThumb({ src, alt }: { src: string | null; alt: string }) {
  if (src) {
    return (
      <MediaImage
        src={src}
        alt={alt}
        className="size-10 shrink-0 rounded-lg border border-border object-cover"
      />
    );
  }

  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
      <Package className="size-4" aria-hidden="true" />
    </span>
  );
}

export function PrescriptionProductPicker({
  value,
  seedItems = [],
  seedImageUrls = {},
  onChange,
  disabled = false,
}: PrescriptionProductPickerProps) {
  const t = useTranslation();
  const fieldId = useId();
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
    isOpen: true,
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
      {
        id: product.id,
        title: product.title,
        ...(product.translations ? { translations: product.translations } : {}),
      },
    ]);
    onChange([...value, product.id]);
  };

  return (
    <div className="space-y-4">
      <label htmlFor={fieldId} className="sr-only">
        {t.search}
      </label>
      {selectedProducts.length > 0 ? (
        <ul className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/80">
          {selectedProducts.map((product) => (
            <li key={product.id} className="flex items-center gap-3 px-3 py-2">
              <ProductThumb
                src={productImageUrl(product, seedImageUrls)}
                alt={getProductMultiLabel(product)}
              />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                {getProductMultiLabel(product)}
              </span>
              {!disabled ? (
                <button
                  type="button"
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label={`${t.deleteAction}: ${getProductMultiLabel(product)}`}
                  onClick={() => toggleProduct(product)}
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-border/80 px-3 py-4 text-sm text-muted-foreground">
          {t.prescriptionProductsEmptyHint}
        </p>
      )}

      <div className="space-y-3 rounded-xl border border-border/80 bg-muted/10 p-3">
        <ProductPickerCatalogFilters
          brandFilter={brandFilter}
          categoryFilter={categoryFilter}
          onBrandFilterChange={setBrandFilter}
          onCategoryFilterChange={setCategoryFilter}
          disabled={disabled}
          showHint
        />

        <div className="relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id={fieldId}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t.prescriptionProductsSearchPlaceholder}
            disabled={disabled}
            className="ps-9"
          />
        </div>

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
          <div className="max-h-64 space-y-1 overflow-y-auto">
            {pageProducts.map((product) => {
              const isSelected = value.includes(product.id);
              const label = getProductMultiLabel(product);
              return (
                <button
                  key={product.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => toggleProduct(product)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-start text-sm",
                    isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted/60",
                  )}
                >
                  <ProductThumb src={productImageUrl(product, seedImageUrls)} alt={label} />
                  <span className="min-w-0 flex-1 truncate">{label}</span>
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
              disabled={page <= 1 || disabled}
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
              disabled={page >= totalPages || disabled}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            >
              {t.nextPage}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
