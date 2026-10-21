import { useCallback, useState } from "react";

import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { type CsvExportParams,downloadCsvExport } from "@/shared/lib/api/csv-export";
import { notify } from "@/shared/lib/notifications";

type UseCrudCsvExportOptions = {
  path: string | undefined;
  params: CsvExportParams;
};

export function useCrudCsvExport({ path, params }: UseCrudCsvExportOptions) {
  const t = useTranslation();
  const [isExporting, setIsExporting] = useState(false);

  const exportCsv = useCallback(async () => {
    if (!path || isExporting) return;

    setIsExporting(true);
    const toastId = notify.loading(t.exportCsvLoading);

    try {
      await downloadCsvExport(path, params);
      notify.success(t.successMessage, t.exportCsvSuccess, { id: toastId });
    } catch (caught) {
      const error = caught instanceof Error ? caught : new Error(String(caught ?? "Request failed"));
      notify.error(t.errorMessage, resolveServiceErrorMessage(error, t), { id: toastId });
    } finally {
      setIsExporting(false);
    }
  }, [isExporting, params, path, t]);

  return {
    exportCsv: path ? exportCsv : undefined,
    isExportingCsv: isExporting,
  };
}
