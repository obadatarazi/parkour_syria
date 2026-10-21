import { productsService } from "@/features/products/services/products.service";
import type {
  ProductImportAction,
  ProductImportItemResult,
  ProductImportProgress,
  ProductImportSummary,
} from "@/features/products/types/product-import.types";
import {
  applyProductImportActionToGroups,
  buildProductImportCsvFile,
  type ProductImportPreviewGroup,
} from "@/features/products/utils/parse-product-import-csv";
import type { Translation } from "@/shared/design-system/localization/locales/en";
import { resolveServiceErrorMessage } from "@/shared/errors";

type RunProductImportOptions = {
  header: string[];
  groups: ProductImportPreviewGroup[];
  batchSize: number;
  /** Admin-chosen mode applied to every row before upload. */
  importAction: ProductImportAction;
  fileName?: string;
  onProgress?: (progress: ProductImportProgress) => void;
  errorMessages: Translation;
};

function chunkGroups<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

function buildProgress(
  current: number,
  total: number,
  succeeded: number,
  failed: number,
  currentProductTitle: string,
  results: ProductImportItemResult[],
  phase: ProductImportProgress["phase"],
  batchCurrent: number,
  batchTotal: number,
): ProductImportProgress {
  const processed = succeeded + failed;

  return {
    current,
    total,
    succeeded,
    failed,
    processed,
    currentProductTitle,
    percent: total === 0 ? 100 : Math.min(100, Math.round((processed / total) * 100)),
    phase,
    results: [...results],
    batchCurrent,
    batchTotal,
  };
}

function mapBatchResults(
  batch: ProductImportPreviewGroup[],
  summaryResults: ProductImportSummary["results"],
): ProductImportItemResult[] {
  return batch.map((group, index) => {
    const apiResult = summaryResults[index];

    if (!apiResult) {
      return {
        rows: group.rowNumbers,
        productTitle: group.titleEn,
        status: "failed",
        reason: "Import failed without a detailed reason.",
        warnings: [],
      };
    }

    return {
      rows: apiResult.rows.length ? apiResult.rows : group.rowNumbers,
      productTitle: apiResult.productTitle || group.titleEn,
      status: apiResult.status,
      operation: apiResult.operation ?? null,
      reason: apiResult.reason ?? null,
      warnings: apiResult.warnings ?? [],
    };
  });
}

/**
 * Imports selected CSV product groups in configurable batches.
 * Each batch is one API request so media prefetch and master-data caching
 * apply across products in the same batch.
 */
export async function runProductImport({
  header,
  groups,
  batchSize,
  importAction,
  fileName = "product-import.csv",
  onProgress,
  errorMessages,
}: RunProductImportOptions): Promise<ProductImportSummary> {
  const prepared = applyProductImportActionToGroups(header, groups, importAction);
  const results: ProductImportItemResult[] = [];
  let succeeded = 0;
  let failed = 0;
  let processedCount = 0;

  const batches = chunkGroups(prepared.groups, batchSize);

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex += 1) {
    const batch = batches[batchIndex];
    const batchCurrent = batchIndex + 1;
    const batchStartTitle = batch[0]?.titleEn ?? "";

    onProgress?.(
      buildProgress(
        processedCount,
        prepared.groups.length,
        succeeded,
        failed,
        batchStartTitle,
        results,
        "importing",
        batchCurrent,
        batches.length,
      ),
    );

    try {
      const file = buildProductImportCsvFile(
        prepared.header,
        batch,
        `batch-${batchCurrent}-${fileName}`,
      );
      const summary = await productsService.importFromCsv(file);
      const batchResults = mapBatchResults(batch, summary.results);

      for (const item of batchResults) {
        processedCount += 1;

        if (item.status === "success") {
          succeeded += 1;
        } else {
          failed += 1;
        }

        results.push(item);
      }
    } catch (error) {
      const reason = resolveServiceErrorMessage(error, errorMessages);

      for (const group of batch) {
        processedCount += 1;
        failed += 1;
        results.push({
          rows: group.rowNumbers,
          productTitle: group.titleEn,
          status: "failed",
          reason,
          warnings: [],
        });
      }
    }

    onProgress?.(
      buildProgress(
        processedCount,
        prepared.groups.length,
        succeeded,
        failed,
        batch[batch.length - 1]?.titleEn ?? "",
        results,
        "importing",
        batchCurrent,
        batches.length,
      ),
    );
  }

  const summary: ProductImportSummary = {
    total: prepared.groups.length,
    succeeded,
    failed,
    results,
  };

  onProgress?.(
    buildProgress(
      prepared.groups.length,
      prepared.groups.length,
      succeeded,
      failed,
      "",
      results,
      "done",
      batches.length,
      batches.length,
    ),
  );

  return summary;
}
