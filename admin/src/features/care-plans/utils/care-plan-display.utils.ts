import type { CarePlanItem } from "@/features/care-plans/types/care-plans.types";

export function getCarePlanItemTitle(item: CarePlanItem, fallback: string): string {
  return item.title?.trim() || item.product?.title?.trim() || fallback;
}

export function getCarePlanItemVariantLabel(item: CarePlanItem): string | null {
  if (item.variantLabel?.trim()) {
    return item.variantLabel.trim();
  }

  const parts = (item.variations ?? [])
    .map((variation) => {
      const attribute = variation.attribute?.trim();
      const value = variation.value?.trim();
      if (attribute && value) {
        return `${attribute}: ${value}`;
      }
      return value || attribute || null;
    })
    .filter((part): part is string => Boolean(part));

  if (parts.length > 0) {
    return parts.join(" · ");
  }

  return item.skuCode?.trim() || item.productVariant?.skuCode?.trim() || item.productVariant?.sku?.trim() || null;
}
