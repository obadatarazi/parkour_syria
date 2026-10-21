import type { InventoryListResult, InventorySummary } from "@/features/inventory/types/inventory.types";
import type {
  ProductListParams,
  ProductStockStatusValue,
} from "@/features/products/types/products.types";

export type InventoryListParams = ProductListParams & {
  stockStatus?: ProductStockStatusValue;
};

export type UpdateInventoryPayload = {
  eanCode?: string | null;
  skuCode?: string | null;
  price?: number | null;
  stock?: number | null;
};

export type InventoryService = {
  list: (params?: InventoryListParams, signal?: AbortSignal) => Promise<InventoryListResult>;
  summary: (params?: InventoryListParams, signal?: AbortSignal) => Promise<InventorySummary>;
  update: (data: UpdateInventoryPayload) => Promise<void>;
};
