import { useCallback, useState } from "react";

import {
  allIdsFailed,
  collectSettledBulkResults,
  createEmptyBulkMutationResult,
  type CrudBulkMutationResult,
} from "@/shared/crud/utils/bulk-mutation.utils";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { notify } from "@/shared/lib/notifications";

type UseCrudBulkBooleanMutationOptions = {
  /** Per-row update. Used when the resource has no bulk-update endpoint. */
  updateFn?: (id: string | number, data: Record<string, boolean>) => Promise<unknown>;
  /** One-shot update for every selected id. Preferred when the API supports it. */
  bulkUpdateFn?: (
    ids: Array<string | number>,
    field: string,
    value: boolean,
  ) => Promise<unknown>;
  onSuccess?: () => void | Promise<void>;
};

export function useCrudBulkBooleanMutation({
  updateFn,
  bulkUpdateFn,
  onSuccess,
}: UseCrudBulkBooleanMutationOptions) {
  const t = useTranslation();
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  const bulkUpdate = useCallback(
    async (
      ids: Array<string | number>,
      field: string,
      value: boolean,
    ): Promise<CrudBulkMutationResult> => {
      if (ids.length === 0) {
        return createEmptyBulkMutationResult();
      }

      setIsBulkUpdating(true);
      const toastId = notify.loading(t.loadingMessage);

      try {
        let result: CrudBulkMutationResult;

        if (bulkUpdateFn) {
          await bulkUpdateFn(ids, field, value);
          result = {
            succeededIds: [...ids],
            failedIds: [],
            errors: [],
          };
        } else if (updateFn) {
          const settled = await Promise.allSettled(ids.map((id) => updateFn(id, { [field]: value })));
          result = collectSettledBulkResults(ids, settled);
        } else {
          throw new Error("No bulk update function configured");
        }

        await onSuccess?.();

        const successCount = result.succeededIds.length;
        const failCount = result.failedIds.length;

        if (failCount === 0) {
          notify.success(
            t.successMessage,
            t.crudBulkUpdateSuccess.replace("{count}", String(successCount)),
            { id: toastId },
          );
        } else if (successCount === 0) {
          const firstError = result.errors[0]?.error;
          notify.error(
            t.errorMessage,
            firstError
              ? resolveServiceErrorMessage(firstError, t)
              : t.crudBulkUpdateFailed.replace("{count}", String(failCount)),
            { id: toastId },
          );
        } else {
          notify.warning(
            t.errorMessage,
            t.crudBulkUpdatePartial
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
        setIsBulkUpdating(false);
      }
    },
    [bulkUpdateFn, onSuccess, t, updateFn],
  );

  return {
    bulkUpdate,
    isBulkUpdating,
  };
}
