import { useCallback } from "react";

import { invoicesService } from "@/features/invoices/services/invoices.service";
import type { InvoicePdfDownload } from "@/features/invoices/types/invoices.types";
import { useCrudMutation } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

function openPdfDownload(result: InvoicePdfDownload) {
  window.open(result.downloadUrl, "_blank", "noopener,noreferrer");
}

export function useInvoicePdfDownload() {
  const t = useTranslation();

  const mutation = useCrudMutation<InvoicePdfDownload, string>({
    mutationFn: (invoiceNumber) => invoicesService.downloadPdf(invoiceNumber),
    feedback: {
      loadingMessage: t.generatingPdf,
      successMessage: t.pdfReady,
      errorMessage: t.pdfDownloadFailed,
    },
    onSuccess: (result) => {
      openPdfDownload(result);
    },
  });

  const downloadPdf = useCallback(
    async (invoiceNumber: string | null | undefined) => {
      if (!invoiceNumber) return;
      await mutation.mutate(invoiceNumber);
    },
    [mutation.mutate],
  );

  return {
    downloadPdf,
    isDownloading: mutation.status === "pending",
  };
}
