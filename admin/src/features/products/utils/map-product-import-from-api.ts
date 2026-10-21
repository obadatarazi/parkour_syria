import type {
  ProductImportItemResult,
  ProductImportOperation,
  ProductImportSummary,
} from "@/features/products/types/product-import.types";

type ProductImportItemApi = {
  rows?: number[];
  product_title?: string;
  status?: ProductImportItemResult["status"];
  operation?: ProductImportOperation | null;
  reason?: string | null;
  warnings?: string[];
};

type ProductImportSummaryApi = {
  total?: number;
  succeeded?: number;
  failed?: number;
  results?: ProductImportItemApi[];
};

function mapOperation(value: unknown): ProductImportOperation | null {
  if (value === "created" || value === "updated") {
    return value;
  }
  return null;
}

export function mapProductImportFromApi(data: ProductImportSummaryApi): ProductImportSummary {
  return {
    total: data.total ?? 0,
    succeeded: data.succeeded ?? 0,
    failed: data.failed ?? 0,
    results: (data.results ?? []).map((item) => ({
      rows: item.rows ?? [],
      productTitle: item.product_title ?? "",
      status: item.status ?? "failed",
      operation: mapOperation(item.operation),
      reason: item.reason ?? null,
      warnings: item.warnings ?? [],
    })),
  };
}
