import { EMPTY_INVENTORY_SUMMARY } from "@/features/inventory/constants/inventory.constants";
import type { InventorySummary } from "@/features/inventory/types/inventory.types";

function readCount(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, value) : 0;
}

export function mapInventorySummaryFromApi(value: unknown): InventorySummary {
  if (!value || typeof value !== "object") {
    return { ...EMPTY_INVENTORY_SUMMARY };
  }

  const summary = value as Record<string, unknown>;

  return {
    totalSkus: readCount(summary.totalSkus),
    inStockCount: readCount(summary.inStockCount),
    lowStockCount: readCount(summary.lowStockCount),
    outOfStock: readCount(summary.outOfStock),
  };
}
