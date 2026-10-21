import { type ApiBlobResult,apiRequest } from "@/shared/lib/api/api-client";
import { buildLaravelExportParams } from "@/shared/lib/api/laravel.utils";

/** Catalog exports can walk the full filtered set; give the stream time to finish. */
export const CSV_EXPORT_TIMEOUT_MS = 180_000;

export type CsvExportParams = Record<string, string | number | boolean | undefined | null>;

function formatExportStamp(date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

function fallbackFilename(path: string): string {
  const segment = path.split("/").filter(Boolean).at(-2) ?? "export";
  return `${segment}-${formatExportStamp()}.csv`;
}

function triggerBrowserDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

/**
 * Downloads `GET {path}` as a CSV. Sends the same query the list uses, minus page/limit.
 */
export async function downloadCsvExport(
  path: string,
  params?: CsvExportParams,
): Promise<void> {
  const { blob, filename } = await apiRequest<ApiBlobResult>(path, {
    method: "GET",
    params: buildLaravelExportParams(params),
    responseType: "blob",
    timeoutMs: CSV_EXPORT_TIMEOUT_MS,
  });

  triggerBrowserDownload(blob, filename || fallbackFilename(path));
}
