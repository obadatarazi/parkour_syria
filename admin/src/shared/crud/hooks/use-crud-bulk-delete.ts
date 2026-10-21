import { useCallback, useState } from "react";

import {
  allIdsFailed,
  createEmptyBulkMutationResult,
  type CrudBulkMutationResult,
  mapBulkDeleteApiResult,
} from "@/shared/crud/utils/bulk-mutation.utils";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import type { BulkDeleteApiResult } from "@/shared/lib/api/bulk-delete";
import { notify } from "@/shared/lib/notifications";

type UseCrudBulkDeleteOptions = {
  bulkDeleteFn: (ids: Array<string | number>) => Promise<BulkDeleteApiResult>;
  onSuccess?: () => void | Promise<void>;
  /** Overrides the success toast body. Use `{count}` for the succeeded count. */
  successDescription?: string;
  partialDescription?: string;
  failedDescription?: string;
};

export function useCrudBulkDelete({
  bulkDeleteFn,
  onSuccess,
  successDescription,
  partialDescription,
  failedDescription,
}: UseCrudBulkDeleteOptions) {
  const t = useTranslation();
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const bulkDelete = useCallback(
    async (ids: Array<string | number>): Promise<CrudBulkMutationResult> => {
      if (ids.length === 0) {
        return createEmptyBulkMutationResult();
      }

      setIsBulkDeleting(true);
      const toastId = notify.loading(t.loadingMessage);

      try {
        const apiResult = await bulkDeleteFn(ids);
        const result = mapBulkDeleteApiResult(ids, apiResult);

        await onSuccess?.();

        const successCount = apiResult.deletedCount;
        const failCount = result.failedIds.length;

        if (failCount === 0) {
          notify.success(
            t.successMessage,
            (successDescription ?? t.crudBulkDeleteSuccess).replace(
              "{count}",
              String(successCount),
            ),
            { id: toastId },
          );
        } else if (successCount === 0) {
          const firstError = result.errors[0]?.error;
          notify.error(
            t.errorMessage,
            firstError
              ? resolveServiceErrorMessage(firstError, t)
              : (failedDescription ?? t.crudBulkDeleteFailed).replace(
                  "{count}",
                  String(failCount),
                ),
            { id: toastId },
          );
        } else {
          notify.warning(
            t.errorMessage,
            (partialDescription ?? t.crudBulkDeletePartial)
              .replace("{successCount}", String(successCount))
              .replace("{failCount}", String(failCount)),
            { id: toastId },
          );
        }

        return result;
      } catch (caught) {
        const error =
          caught instanceof Error ? caught : new Error(String(caught ?? "Request failed"));
        notify.error(t.errorMessage, resolveServiceErrorMessage(error, t), { id: toastId });
        return allIdsFailed(ids, error);
      } finally {
        setIsBulkDeleting(false);
      }
    },
    [
      bulkDeleteFn,
      failedDescription,
      onSuccess,
      partialDescription,
      successDescription,
      t,
    ],
  );

  return {
    bulkDelete,
    isBulkDeleting,
  };
}
