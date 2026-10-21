export type ProductImportResultStatus = "success" | "failed";

/** Matches backend ProductImportService result `operation` on success. */
export type ProductImportOperation = "created" | "updated";

/**
 * Optional CSV column `attribute` (alias `action`).
 * Empty → upsert (create when SKU is new, update when it exists).
 */
export type ProductImportAction = "create" | "update" | "upsert";

export type ProductImportItemResult = {
  rows: number[];
  productTitle: string;
  status: ProductImportResultStatus;
  operation?: ProductImportOperation | null;
  reason?: string | null;
  warnings: string[];
};

export type ProductImportSummary = {
  total: number;
  succeeded: number;
  failed: number;
  results: ProductImportItemResult[];
};

export type ProductImportProgress = {
  current: number;
  total: number;
  succeeded: number;
  failed: number;
  processed: number;
  currentProductTitle: string;
  percent: number;
  phase: "importing" | "done";
  results: ProductImportItemResult[];
  batchCurrent: number;
  batchTotal: number;
};
