import { useCallback, useState } from "react";

import type {
  ProductImportAction,
  ProductImportProgress,
  ProductImportSummary,
} from "@/features/products/types/product-import.types";
import type { ProductImportPreviewGroup } from "@/features/products/utils/parse-product-import-csv";
import { runProductImport } from "@/features/products/utils/run-product-import";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { notify } from "@/shared/lib/notifications";

type UseProductImportOptions = {
  onSuccess?: (summary: ProductImportSummary) => void | Promise<void>;
  onProgress?: (progress: ProductImportProgress) => void;
};

type ImportSelectedInput = {
  header: string[];
  groups: ProductImportPreviewGroup[];
  batchSize: number;
  importAction: ProductImportAction;
  fileName?: string;
};

export function useProductImport({ onSuccess, onProgress }: UseProductImportOptions = {}) {
  const t = useTranslation();
  const [isPending, setIsPending] = useState(false);
  const [progress, setProgress] = useState<ProductImportProgress | null>(null);

  const reset = useCallback(() => {
    setIsPending(false);
    setProgress(null);
  }, []);

  const mutate = useCallback(
    async ({ header, groups, batchSize, importAction, fileName }: ImportSelectedInput) => {
      setIsPending(true);
      setProgress({
        current: 0,
        total: groups.length,
        succeeded: 0,
        failed: 0,
        processed: 0,
        currentProductTitle: "",
        percent: 0,
        phase: "importing",
        results: [],
        batchCurrent: 0,
        batchTotal: Math.max(1, Math.ceil(groups.length / batchSize)),
      });

      try {
        const summary = await runProductImport({
          header,
          groups,
          batchSize,
          importAction,
          fileName,
          errorMessages: t,
          onProgress: (nextProgress) => {
            setProgress(nextProgress);
            onProgress?.(nextProgress);
          },
        });

        if (summary.failed === 0) {
          notify.success(t.productImportSuccessTitle, t.productImportSuccessDescription);
        } else if (summary.succeeded === 0) {
          notify.error(t.productImportAllFailedTitle, t.productImportAllFailedDescription);
        } else {
          notify.warning(
            t.productImportPartialSuccessTitle,
            t.productImportPartialSuccessDescription
              .replace("{succeeded}", String(summary.succeeded))
              .replace("{failed}", String(summary.failed)),
          );
        }

        await onSuccess?.(summary);
        return { ok: true as const, data: summary };
      } catch {
        notify.error(t.errorMessage, t.productImportLoading);
        return { ok: false as const };
      } finally {
        setIsPending(false);
      }
    },
    [onProgress, onSuccess, t],
  );

  return {
    mutate,
    reset,
    isPending,
    progress,
  };
}
