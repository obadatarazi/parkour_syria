import { Check, X } from "lucide-react";
import { useEffect, useId, useRef } from "react";

import { getProductMultiLabel } from "@/features/coupons/hooks/use-product-multi-picker";
import { useCouponProductVariants } from "@/features/coupons/hooks/use-coupon-product-variants";
import type { CouponRelationItem } from "@/features/coupons/types/coupons.types";
import type { ProductVariant } from "@/features/products/types/products.types";
import { getVariantDisplayLabel } from "@/features/products/utils/variant-attribute.utils";
import { FormField } from "@/shared/components";
import { Button } from "@/shared/design-system/components/ui/button";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { cn } from "@/shared/design-system/components/ui/utils";

type CouponProductVariantPickerProps = {
  productIds: number[];
  value: number[];
  seedItems?: CouponRelationItem[];
  onChange: (variantIds: number[]) => void;
  disabled?: boolean;
};

function variantLabel(variant: ProductVariant, seed?: CouponRelationItem): string {
  const display = getVariantDisplayLabel(variant, "");
  const sku = variant.skuCode?.trim() || seed?.skuCode?.trim();
  if (display && sku && display !== sku) return `${display} · ${sku}`;
  return display || sku || seed?.title || `#${variant.id}`;
}

export function CouponProductVariantPicker({
  productIds,
  value,
  seedItems = [],
  onChange,
  disabled = false,
}: CouponProductVariantPickerProps) {
  const t = useTranslation();
  const fieldId = useId();
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const { variableProducts, allowedVariantIds, isLoading, isError, error, refetch, isSuccess } =
    useCouponProductVariants(productIds, productIds.length > 0);

  useEffect(() => {
    if (productIds.length === 0) {
      if (value.length > 0) onChangeRef.current([]);
      return;
    }
    if (!isSuccess) return;
    const allowed = new Set(allowedVariantIds);
    const next = value.filter((id) => allowed.has(id));
    if (next.length !== value.length) onChangeRef.current(next);
  }, [allowedVariantIds, isSuccess, productIds.length, value]);

  if (productIds.length === 0) return null;

  if (isLoading) {
    return (
      <FormField fieldId={fieldId} label={t.variants} helperText={t.couponProductVariantIdsHint}>
        <p className="text-sm text-muted-foreground">{t.loadingMessage}</p>
      </FormField>
    );
  }

  if (isError) {
    return (
      <FormField fieldId={fieldId} label={t.variants}>
        <div className="space-y-2">
          <p className="text-sm text-destructive">{resolveServiceErrorMessage(error, t)}</p>
          <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
            {t.tryAgain}
          </Button>
        </div>
      </FormField>
    );
  }

  if (variableProducts.length === 0) return null;

  const seedById = new Map(seedItems.map((item) => [item.id, item]));
  const selectedVariants = variableProducts
    .flatMap((group) => group.variants)
    .filter((variant) => value.includes(variant.id));

  const toggleVariant = (variantId: number) => {
    if (value.includes(variantId)) {
      onChange(value.filter((id) => id !== variantId));
      return;
    }
    onChange([...value, variantId]);
  };

  return (
    <FormField fieldId={fieldId} label={t.variants} helperText={t.couponProductVariantIdsHint}>
      <div className="space-y-3">
        {selectedVariants.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedVariants.map((variant) => (
              <span
                key={variant.id}
                className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1 text-xs"
              >
                {variantLabel(variant, seedById.get(variant.id))}
                {!disabled ? (
                  <button
                    type="button"
                    className="rounded p-0.5 hover:bg-muted"
                    onClick={() => toggleVariant(variant.id)}
                    aria-label={t.removeItem}
                  >
                    <X className="size-3" />
                  </button>
                ) : null}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t.couponVariantsAllHint}</p>
        )}

        <div className="space-y-3">
          {variableProducts.map(({ product, variants }) => (
            <div key={product.id} className="space-y-2 rounded-xl border border-border bg-muted/10 p-3">
              <p className="text-sm font-medium text-foreground">{getProductMultiLabel(product)}</p>
              <div className="flex flex-wrap gap-2">
                {variants.map((variant) => {
                  const isSelected = value.includes(variant.id);
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => toggleVariant(variant.id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:bg-muted/60",
                      )}
                    >
                      {isSelected ? <Check className="size-3 shrink-0" /> : null}
                      <span>{variantLabel(variant, seedById.get(variant.id))}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </FormField>
  );
}
