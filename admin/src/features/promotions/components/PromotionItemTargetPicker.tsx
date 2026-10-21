import { Check, ChevronDown, X } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";

import {
  getProductMultiLabel,
  useProductMultiPicker,
} from "@/features/coupons/hooks/use-product-multi-picker";
import { ProductPickerCatalogFilters } from "@/features/products/components/ProductPickerCatalogFilters";
import { RelationPickerPanel } from "@/features/products/components/RelationPickerPanel";
import { useProductPickerCatalogFilters } from "@/features/products/hooks/use-product-picker-catalog-filters";
import { productsService } from "@/features/products/services/products.service";
import type {
  Product,
  ProductVariant,
  RelationPickerSeed,
} from "@/features/products/types/products.types";
import {
  getVariantDisplayLabel,
  normalizeProductType,
} from "@/features/products/utils/variant-attribute.utils";
import type { PromotionItem } from "@/features/promotions/types/promotions.types";
import { FormField } from "@/shared/components";
import { useCrudQuery } from "@/shared/crud";
import { Button } from "@/shared/design-system/components/ui/button";
import { Input } from "@/shared/design-system/components/ui/input";
import { cn } from "@/shared/design-system/components/ui/utils";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";

export type PromotionItemTargetValue = {
  productId: number | null;
  productVariantId: number | null;
};

type PromotionItemTargetPickerProps = {
  value: PromotionItemTargetValue;
  seedItem?: PromotionItem | null;
  onChange: (value: PromotionItemTargetValue) => void;
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

function seedFromItem(item?: PromotionItem | null): RelationPickerSeed[] {
  if (!item?.productId) return [];
  return [
    {
      id: item.productId,
      title: item.title ?? `#${item.productId}`,
    },
  ];
}

function variantLabel(variant: ProductVariant): string {
  const display = getVariantDisplayLabel(variant, "");
  const sku = variant.skuCode?.trim();
  if (display && sku && display !== sku) return `${display} · ${sku}`;
  return display || sku || `#${variant.id}`;
}

export function PromotionItemTargetPicker({
  value,
  seedItem,
  onChange,
  disabled = false,
  error,
}: PromotionItemTargetPickerProps) {
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

  const selectedProductId = value.productVariantId
    ? (seedItem?.productId ?? value.productId)
    : value.productId;

  const selectedIds = selectedProductId != null ? [selectedProductId] : [];
  const seedItems = seedFromItem(seedItem);

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
    selectedIds,
    seedItems,
    pickedItems,
    enabled: !disabled,
    isOpen,
    brandId,
    categoryId,
  });

  const selectedProduct = selectedProducts[0] ?? null;

  const productDetailQuery = useCrudQuery({
    queryKey: ["products", "promotion-target", String(selectedProductId ?? "")],
    queryFn: (signal) => productsService.getById(selectedProductId!, signal),
    enabled: selectedProductId != null && selectedProductId > 0,
  });

  const productType = normalizeProductType(
    productDetailQuery.data?.type ?? selectedProduct?.type ?? seedItem?.type,
  );
  const variants = useMemo(
    () => productDetailQuery.data?.variants ?? [],
    [productDetailQuery.data?.variants],
  );

  useEffect(() => {
    if (!selectedProductId || !productDetailQuery.data) return;
    const type = normalizeProductType(productDetailQuery.data.type);
    if (type === "SIMPLE" && value.productVariantId != null) {
      onChange({ productId: selectedProductId, productVariantId: null });
    }
  }, [onChange, productDetailQuery.data, selectedProductId, value.productVariantId]);

  const selectedLabel = useMemo(() => {
    if (value.productVariantId != null) {
      const variant = variants.find((item) => item.id === value.productVariantId);
      const productTitle =
        selectedProduct != null
          ? getProductMultiLabel(selectedProduct)
          : (seedItem?.title ?? `#${selectedProductId}`);
      return variant ? `${productTitle} · ${variantLabel(variant)}` : (seedItem?.title ?? productTitle);
    }
    if (selectedProduct) return getProductMultiLabel(selectedProduct);
    if (seedItem?.title) return seedItem.title;
    if (value.productId != null) return `#${value.productId}`;
    return null;
  }, [
    seedItem?.title,
    selectedProduct,
    selectedProductId,
    value.productId,
    value.productVariantId,
    variants,
  ]);

  const selectProduct = (product: Product) => {
    setPickedItems((current) => [
      ...current.filter((item) => item.id !== product.id),
      productToSeed(product),
    ]);
    const type = normalizeProductType(product.type);
    if (type === "SIMPLE") {
      onChange({ productId: product.id, productVariantId: null });
      setIsOpen(false);
      return;
    }
    onChange({ productId: product.id, productVariantId: null });
    setIsOpen(false);
  };

  const clearSelection = () => {
    onChange({ productId: null, productVariantId: null });
    setPickedItems([]);
  };

  return (
    <div className="space-y-3">
      <FormField
        fieldId={fieldId}
        label={t.product}
        error={error}
        helperText={t.promotionItemTargetHint}
        required
      >
        <div className="space-y-3">
          {selectedLabel ? (
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex max-w-full items-center gap-1 rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1 text-xs">
                <span className="truncate">{selectedLabel}</span>
                {!disabled ? (
                  <button
                    type="button"
                    className="rounded p-0.5 hover:bg-muted"
                    onClick={clearSelection}
                    aria-label={t.closePicker}
                  >
                    <X className="size-3" />
                  </button>
                ) : null}
              </span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t.promotionSelectProduct}</p>
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
            <span>{isOpen ? t.closePicker : t.promotionSelectProduct}</span>
            <ChevronDown className={cn("size-4 transition-transform", isOpen && "rotate-180")} />
          </Button>

          {isOpen ? (
            <RelationPickerPanel panelId={panelId} onClose={() => setIsOpen(false)}>
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
                placeholder={t.searchProducts}
                disabled={disabled}
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
                <p className="text-sm text-muted-foreground">{t.noData}</p>
              ) : (
                <div className="max-h-52 space-y-1 overflow-y-auto">
                  {pageProducts.map((product) => {
                    const isSelected = selectedIds.includes(product.id);
                    return (
                      <button
                        key={product.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => selectProduct(product)}
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
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
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
                    disabled={page >= totalPages}
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

      {selectedProductId != null && productType === "VARIABLE_PRODUCT" ? (
        <FormField
          fieldId={`${fieldId}-variant`}
          label={t.variants}
          helperText={t.promotionVariantRequiredHint}
          error={!value.productVariantId && !disabled ? t.promotionVariantRequired : undefined}
          required
        >
          {productDetailQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">{t.loadingMessage}</p>
          ) : variants.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.noData}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {variants.map((variant) => {
                const selected = value.productVariantId === variant.id;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                      onChange({
                        productId: null,
                        productVariantId: variant.id,
                      })
                    }
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition",
                      selected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background hover:bg-muted/50",
                    )}
                  >
                    {selected ? <Check className="size-3.5" /> : null}
                    {variantLabel(variant)}
                  </button>
                );
              })}
            </div>
          )}
        </FormField>
      ) : null}
    </div>
  );
}
