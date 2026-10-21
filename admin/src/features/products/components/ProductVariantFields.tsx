import { ChevronDown, Info, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import type { Attribute } from "@/features/attributes/types/attributes.types";
import { AttributeValueSelector } from "@/features/products/components/AttributeValueSelector";
import { ProductDiscountFields } from "@/features/products/components/ProductDiscountFields";
import { ProductImageGalleryFields } from "@/features/products/components/ProductImageGalleryFields";
import type { ProductType, ProductVariantFormItem } from "@/features/products/types/products.types";
import { createEmptyProductVariantFormItem } from "@/features/products/types/products.types";
import { formatVariantPriceLabel } from "@/features/products/utils/product-display.utils";
import { AppButton, TextField, ToggleField } from "@/shared/components";
import { cn } from "@/shared/design-system/components/ui/utils";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type ProductVariantFieldsProps = {
  type: ProductType;
  variants: ProductVariantFormItem[];
  deletedVariantIds: number[];
  onChange: (variants: ProductVariantFormItem[], deletedVariantIds: number[]) => void;
  error?: string;
  showDiscountRequiredError?: boolean;
  allowedAttributeIds?: number[];
  allowedAttributeValueIds?: number[];
  isAttributePoolConfigured?: boolean;
  seedAttributes?: Attribute[];
};

function getVariantKey(variant: ProductVariantFormItem, index: number): string {
  return variant.id != null ? `id-${variant.id}` : `new-${index}`;
}

function VariantsTabNote({ type }: { type: ProductType }) {
  const t = useTranslation();
  const isSimple = type === "SIMPLE";

  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border p-4 text-sm",
        isSimple
          ? "border-blue-200 bg-blue-50/80 text-blue-950"
          : "border-amber-200 bg-amber-50/80 text-amber-950",
      )}
    >
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="space-y-1">
        <p className="font-medium">{isSimple ? t.simpleVariantNoteTitle : t.variantOptionsNoteTitle}</p>
        <p className="text-[13px] leading-relaxed opacity-90">
          {isSimple ? t.simpleProductNoVariantsNote : t.variantOptionsNoteDescription}
        </p>
      </div>
    </div>
  );
}

export function ProductVariantFields({
  type,
  variants,
  deletedVariantIds,
  onChange,
  error,
  showDiscountRequiredError = false,
  allowedAttributeIds = [],
  allowedAttributeValueIds = [],
  isAttributePoolConfigured = true,
  seedAttributes = [],
}: ProductVariantFieldsProps) {
  const t = useTranslation();
  const isSimple = type === "SIMPLE";
  const [expandedByKey, setExpandedByKey] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setExpandedByKey((current) => {
      const next = { ...current };
      variants.forEach((variant, index) => {
        const key = getVariantKey(variant, index);
        if (!(key in next)) {
          next[key] = index === 0;
        }
      });
      return next;
    });
  }, [variants]);

  if (isSimple) {
    return (
      <div className="space-y-4">
        <VariantsTabNote type={type} />
        <p className="text-sm text-muted-foreground">{t.simpleProductInventoryHint}</p>
      </div>
    );
  }

  const isVariantExpanded = (key: string, index: number) => expandedByKey[key] ?? index === 0;

  const toggleExpanded = (key: string, index: number) => {
    setExpandedByKey((current) => ({
      ...current,
      [key]: !(current[key] ?? index === 0),
    }));
  };

  const updateVariant = (index: number, variant: ProductVariantFormItem) => {
    onChange(
      variants.map((entry, entryIndex) => (entryIndex === index ? variant : entry)),
      deletedVariantIds,
    );
  };

  const addVariant = () => {
    const nextVariants = [...variants, createEmptyProductVariantFormItem()];
    const newKey = getVariantKey(nextVariants[nextVariants.length - 1], nextVariants.length - 1);
    onChange(nextVariants, deletedVariantIds);
    setExpandedByKey((current) => ({ ...current, [newKey]: true }));
  };

  const removeVariant = (index: number) => {
    const target = variants[index];
    const nextDeletedIds =
      target?.id && !deletedVariantIds.includes(target.id)
        ? [...deletedVariantIds, target.id]
        : deletedVariantIds;

    const nextVariants = variants.filter((_, entryIndex) => entryIndex !== index);
    onChange(
      nextVariants.length ? nextVariants : [createEmptyProductVariantFormItem()],
      nextDeletedIds,
    );
  };

  return (
    <div className="space-y-4">
      <VariantsTabNote type={type} />

      {!isAttributePoolConfigured ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-950">
          {t.productVariantsConfigureAttributesFirst}
        </div>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {variants.map((variant, index) => {
        const variantKey = getVariantKey(variant, index);
        const cardTitle = t.variantOptionNumber.replace("{n}", String(index + 1));
        const isExpanded = isVariantExpanded(variantKey, index);

        return (
          <div
            key={variantKey}
            className="overflow-hidden rounded-xl border border-border bg-muted/10"
          >
            <div className="flex items-start gap-2 p-3">
              <button
                type="button"
                onClick={() => toggleExpanded(variantKey, index)}
                className="flex min-w-0 flex-1 items-start gap-2 rounded-lg text-start transition-colors hover:bg-muted/40"
                aria-expanded={isExpanded}
              >
                <ChevronDown
                  className={cn(
                    "mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform",
                    isExpanded && "rotate-180",
                  )}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{cardTitle}</p>
                    {!isExpanded ? (
                      <>
                        <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          {formatVariantPriceLabel(variant)}
                        </span>
                        <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          {t.stock}: {variant.stock}
                        </span>
                      </>
                    ) : null}
                  </div>
                  {isExpanded ? (
                    <p className="text-xs text-muted-foreground">{t.variantOptionCardHint}</p>
                  ) : null}
                </div>
              </button>

              {variants.length > 1 ? (
                <AppButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0"
                  onClick={() => removeVariant(index)}
                  aria-label={t.deleteAction}
                >
                  <Trash2 className="size-4" />
                </AppButton>
              ) : null}
            </div>

            {isExpanded ? (
              <div className="space-y-4 border-t border-border/60 p-4 pt-3">
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    label={t.skuCode}
                    value={variant.skuCode}
                    onChange={(event) =>
                      updateVariant(index, { ...variant, skuCode: event.target.value })
                    }
                    required
                  />
                  <TextField
                    label={t.eanCode}
                    value={variant.eanCode}
                    onChange={(event) =>
                      updateVariant(index, { ...variant, eanCode: event.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    label={t.price}
                    type="number"
                    min={0}
                    step="0.1"
                    value={String(variant.price)}
                    onChange={(event) =>
                      updateVariant(index, {
                        ...variant,
                        price: Number(event.target.value) || 0,
                      })
                    }
                    required
                  />
                  <TextField
                    label={t.stock}
                    type="number"
                    min={0}
                    value={String(variant.stock)}
                    onChange={(event) =>
                      updateVariant(index, {
                        ...variant,
                        stock: Number(event.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>

                <ToggleField
                  label={t.hasDiscountPrice}
                  checked={variant.hasDiscountPrice}
                  onCheckedChange={(checked) =>
                    updateVariant(index, {
                      ...variant,
                      hasDiscountPrice: checked,
                      ...(checked
                        ? {}
                        : {
                            priceDiscount: null,
                            priceDiscountPercentage: "",
                            discountStartAt: "",
                            discountExpireAt: "",
                          }),
                    })
                  }
                />

                {variant.hasDiscountPrice ? (
                  <ProductDiscountFields
                    price={variant.price}
                    priceDiscount={variant.priceDiscount}
                    priceDiscountPercentage={variant.priceDiscountPercentage}
                    discountStartAt={variant.discountStartAt}
                    discountExpireAt={variant.discountExpireAt}
                    onChange={(discount) => updateVariant(index, { ...variant, ...discount })}
                    showRequiredError={
                      showDiscountRequiredError &&
                      (variant.priceDiscount == null || Number(variant.priceDiscount) <= 0)
                    }
                  />
                ) : null}

                <AttributeValueSelector
                  key={variantKey}
                  instanceKey={variantKey}
                  attributeIds={variant.attributeIds}
                  attributeValueIds={variant.attributeValueIds}
                  onChange={(attributeIds, attributeValueIds) =>
                    updateVariant(index, { ...variant, attributeIds, attributeValueIds })
                  }
                  allowedAttributeIds={allowedAttributeIds}
                  allowedAttributeValueIds={allowedAttributeValueIds}
                  seedAttributes={seedAttributes}
                  selectionMode="single"
                  disabled={!isAttributePoolConfigured}
                  label={t.variantAttributeSelection}
                />

                <ProductImageGalleryFields
                  images={variant.images}
                  deletedImageIds={variant.deletedImageIds}
                  onChange={(images, variantDeletedImageIds) =>
                    updateVariant(index, {
                      ...variant,
                      images,
                      deletedImageIds: variantDeletedImageIds,
                    })
                  }
                />
              </div>
            ) : null}
          </div>
        );
      })}

      <AppButton type="button" variant="outline" onClick={addVariant} className="w-full sm:w-auto">
        <Plus className="size-4" />
        {t.addVariantOption}
      </AppButton>
    </div>
  );
}
