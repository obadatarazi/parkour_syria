import type { Product, ProductVariant } from "@/features/products/types/products.types";
import type { PaginatedResult } from "@/shared/types";

export type StockStatus = "in" | "low" | "out";

export type InventorySummary = {
  totalSkus: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStock: number;
};

export type InventoryListResult = PaginatedResult<Product> & {
  summary: InventorySummary;
};

export type InventoryVariantRow = {
  id: string;
  key: string;
  product: Product;
  variant: ProductVariant;
  stockStatus: StockStatus;
};
