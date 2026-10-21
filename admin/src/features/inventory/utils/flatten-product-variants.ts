import { LOW_STOCK_THRESHOLD } from "@/features/inventory/constants/inventory.constants";
import type { InventoryVariantRow, StockStatus } from "@/features/inventory/types/inventory.types";
import type { Product, ProductStockStatus } from "@/features/products/types/products.types";
import { getFeaturedProductImage } from "@/features/products/utils/product-display.utils";
import {
  getVariantDisplayLabel,
  normalizeProductType,
} from "@/features/products/utils/variant-attribute.utils";

export function getStockStatus(stock: number, threshold = LOW_STOCK_THRESHOLD): StockStatus {
  if (stock <= 0) return "out";
  if (stock <= threshold) return "low";
  return "in";
}

export function mapApiStockStatus(status?: ProductStockStatus | null): StockStatus | null {
  if (!status?.value) return null;

  switch (status.value) {
    case "OUT_OF_STOCK":
      return "out";
    case "LOW_STOCK":
      return "low";
    case "IN_STOCK":
      return "in";
    default:
      return null;
  }
}

export function getInventoryRowSku(row: InventoryVariantRow): string {
  return row.variant.skuCode?.trim() || row.product.skuCode?.trim() || "";
}

export function flattenProductVariants(products: Product[]): InventoryVariantRow[] {
  return products.flatMap((product) => {
    if (normalizeProductType(product.type) === "SIMPLE") {
      const stock = product.stock ?? 0;

      return [
        {
          id: `${product.id}-simple`,
          key: `${product.id}-simple`,
          product,
          variant: {
            id: 0,
            price: product.price ?? 0,
            stock,
            skuCode: product.skuCode ?? "",
            eanCode: product.eanCode ?? "",
            hasDiscountPrice: product.hasDiscountPrice,
            attributes: product.attributes,
            attributeValues: product.attributeValues,
            images: product.images,
          },
          stockStatus: mapApiStockStatus(product.status) ?? getStockStatus(stock),
        },
      ];
    }

    // Fallback if a variable product has no variants[] (should not happen on inventory LIST).
    if (!product.variants.length) {
      const stock = product.stock ?? 0;
      return [
        {
          id: `${product.id}-aggregate`,
          key: `${product.id}-aggregate`,
          product,
          variant: {
            id: 0,
            price: product.priceRange?.min ?? product.price ?? 0,
            stock,
            skuCode: product.skuCode ?? "",
            eanCode: product.eanCode ?? "",
            hasDiscountPrice: product.hasDiscountPrice,
            attributes: product.attributes ?? [],
            attributeValues: product.attributeValues ?? [],
            images: product.images ?? [],
          },
          stockStatus: mapApiStockStatus(product.status) ?? getStockStatus(stock),
        },
      ];
    }

    return product.variants.map((variant) => ({
      id: `${product.id}-${variant.id}`,
      key: `${product.id}-${variant.id}`,
      product,
      variant,
      stockStatus: getStockStatus(variant.stock),
    }));
  });
}

export function filterInventoryRows(
  rows: InventoryVariantRow[],
  stockStatus: StockStatus | null,
  search: string,
): InventoryVariantRow[] {
  const normalizedSearch = search.trim().toLowerCase();

  return rows.filter((row) => {
    if (stockStatus && row.stockStatus !== stockStatus) {
      return false;
    }

    if (!normalizedSearch) return true;

    const haystack = [
      row.product.title,
      row.product.brand.title,
      getVariantDisplayLabel(row.variant),
      row.variant.skuCode,
      row.variant.eanCode,
      row.product.skuCode ?? "",
      row.product.eanCode ?? "",
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedSearch);
  });
}

export function getInventorySummary(rows: InventoryVariantRow[]) {
  return {
    totalSkus: rows.length,
    inStockCount: rows.filter((row) => row.stockStatus === "in").length,
    lowStockCount: rows.filter((row) => row.stockStatus === "low").length,
    outOfStock: rows.filter((row) => row.stockStatus === "out").length,
  };
}

export function getInventoryRowImage(row: InventoryVariantRow): string | null {
  return (
    row.variant.images.find((image) => image.featured)?.imageFileUrl ??
    row.variant.images[0]?.imageFileUrl ??
    getFeaturedProductImage(row.product.images)
  );
}
