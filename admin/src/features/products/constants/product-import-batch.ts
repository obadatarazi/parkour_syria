export const PRODUCT_IMPORT_BATCH_PRESETS = [20, 50, 60, 100] as const;

export const PRODUCT_IMPORT_DEFAULT_BATCH_PRESET = 20;

export const PRODUCT_IMPORT_MAX_BATCH_SIZE = 500;

/** Matches backend `set_time_limit(300)` in ProductImportService. */
export const PRODUCT_IMPORT_REQUEST_TIMEOUT_MS = 300_000;

export type ProductImportBatchPreset = (typeof PRODUCT_IMPORT_BATCH_PRESETS)[number];

export type ProductImportBatchSizeSelection = `${ProductImportBatchPreset}` | "custom";

export function resolveProductImportBatchSize(
  selection: ProductImportBatchSizeSelection,
  customValue: string,
): number | null {
  if (selection === "custom") {
    const parsed = Number.parseInt(customValue.trim(), 10);

    if (!Number.isFinite(parsed) || parsed < 1) {
      return null;
    }

    return Math.min(parsed, PRODUCT_IMPORT_MAX_BATCH_SIZE);
  }

  return Number.parseInt(selection, 10);
}
