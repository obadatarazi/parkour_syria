import { useCallback } from "react";

import { ordersService } from "@/features/orders/services/orders.service";
import type { OrderPackingSlipDownload } from "@/features/orders/types/orders.types";
import { useCrudMutation } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

function openPdfDownload(result: OrderPackingSlipDownload) {
  window.open(result.downloadUrl, "_blank", "noopener,noreferrer");
}

export function useOrderPackingSlipDownload() {
  const t = useTranslation();

  const mutation = useCrudMutation<OrderPackingSlipDownload, string>({
    mutationFn: (orderRefNumber) => ordersService.downloadPackingSlip(orderRefNumber),
    feedback: {
      loadingMessage: t.generatingPdf,
      successMessage: t.pdfReady,
      errorMessage: t.pdfDownloadFailed,
    },
    onSuccess: (result) => {
      openPdfDownload(result);
    },
  });

  // useCrudMutation's mutate is a stable callback; depend on it, not on the object around it.
  const { mutate } = mutation;

  const downloadPackingSlip = useCallback(
    async (orderRefNumber: string | null | undefined) => {
      if (!orderRefNumber) return;
      await mutate(orderRefNumber);
    },
    [mutate],
  );

  return {
    downloadPackingSlip,
    isDownloading: mutation.status === "pending",
  };
}
