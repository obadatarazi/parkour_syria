import type { Product, ProductVariant } from "@/features/products/types/products.types";
import {
  formatBilingualLabel,
  getBilingualTitle,
} from "@/shared/lib/translation-display.utils";

export type ProductAttributeItem = {
  id: number;
  title?: string;
  translations?: Partial<Record<"en" | "ar", { title?: string }>>;
  attribute?: {
    id: number;
    title?: string;
    translations?: Partial<Record<"en" | "ar", { title?: string }>>;
  } | null;
};

/** Accepts current API values plus legacy `VARIANT` from older payloads. */
export type ProductTypeInput =
  | Product["type"]
  | "VARIANT"
  | { label: string; value: Product["type"] | "VARIANT" };

export function normalizeProductType(type: ProductTypeInput | undefined): Product["type"] {
  if (!type) return "SIMPLE";
  const value = typeof type === "string" ? type : type.value;
  if (value === "VARIABLE_PRODUCT" || value === "VARIANT") {
    return "VARIABLE_PRODUCT";
  }
  return "SIMPLE";
}

export function getAttributeItemLabel(item: ProductAttributeItem): string {
  if (item.title?.trim()) return item.title;
  return formatBilingualLabel(getBilingualTitle(item.translations, ""));
}

/** API may return only attributeValues with nested attribute — derive attribute ids for the form. */
export function extractAttributeIdsFromItems(
  attributes: ProductAttributeItem[] = [],
  attributeValues: ProductAttributeItem[] = [],
): number[] {
  const ids = new Set<number>();

  for (const attribute of attributes) {
    ids.add(attribute.id);
  }

  for (const attributeValue of attributeValues) {
    if (attributeValue.attribute?.id) {
      ids.add(attributeValue.attribute.id);
    }
  }

  return [...ids];
}

/** Stable unique attribute/value id lists for form state and API payloads. */
export function uniqueNumberIds(ids: number[]): number[] {
  return [...new Set(ids)];
}

export function getVariantDisplayLabel(variant: ProductVariant, fallback = "—"): string {
  if (variant.attributeValues.length > 0) {
    const labels = variant.attributeValues
      .map(getAttributeItemLabel)
      .filter((label) => label.trim().length > 0);

    if (labels.length > 0) {
      return labels.join(" · ");
    }
  }
  if (variant.skuCode?.trim()) {
    return variant.skuCode;
  }
  return fallback;
}

export function getProductAttributeDisplayLabel(product: Product): string {
  if (normalizeProductType(product.type) === "SIMPLE" && product.attributeValues.length > 0) {
    return product.attributeValues.map(getAttributeItemLabel).join(" · ");
  }
  return "";
}

export function getProductStock(product: Product): number {
  if (normalizeProductType(product.type) === "SIMPLE") {
    return product.stock ?? 0;
  }
  // Slim list may omit variants[] and send aggregate stock / status instead.
  if (product.stock != null) {
    return product.stock;
  }
  if (!product.variants.length) {
    return 0;
  }
  return product.variants.reduce((total, variant) => total + variant.stock, 0);
}

export function getProductDisplayPrice(product: Product): number | null {
  if (normalizeProductType(product.type) === "SIMPLE") {
    return product.price ?? null;
  }
  if (product.priceRange?.min != null) {
    return product.priceRange.min;
  }
  if (!product.variants.length) return null;
  return Math.min(...product.variants.map((variant) => variant.price));
}
