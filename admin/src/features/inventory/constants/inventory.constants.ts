/**
 * Fallback when the `LOW_STOCK_THRESHOLD` multi-type setting is unavailable.
 * Backend default (and seeder value) is 5 via MultiTypeSettingService::lowStockThreshold().
 */
export const LOW_STOCK_THRESHOLD = 5;

export const INVENTORY_STOCK_STATUS_FILTER_ID = "stockStatus";

/** UI filter values → API `stockStatus` query enum. */
export const INVENTORY_STOCK_STATUS_TO_API = {
  in: "IN_STOCK",
  low: "LOW_STOCK",
  out: "OUT_OF_STOCK",
} as const;

export const EMPTY_INVENTORY_SUMMARY = {
  totalSkus: 0,
  inStockCount: 0,
  lowStockCount: 0,
  outOfStock: 0,
} as const;
