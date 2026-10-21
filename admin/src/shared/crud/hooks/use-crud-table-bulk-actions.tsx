import { Trash2 } from "lucide-react";
import { type ReactNode,useCallback, useState } from "react";

import { AppButton } from "@/shared/components/buttons/AppButton";
import { CrudBulkActionBar } from "@/shared/crud/components/CrudBulkActionBar";
import type { CrudSelectionState } from "@/shared/crud/types/crud.types";
import type { CrudBulkMutationResult } from "@/shared/crud/utils/bulk-mutation.utils";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type UseCrudTableBulkActionsOptions = {
  selection: CrudSelectionState;
  canDelete?: boolean;
  onBulkDelete: (
    ids: Array<string | number>,
  ) => void | Promise<void | CrudBulkMutationResult>;
  isDeleting?: boolean;
  extraActions?: ReactNode;
  renderExtraActions?: () => ReactNode;
};

function applyBulkSelectionResult(
  selection: CrudSelectionState,
  result: CrudBulkMutationResult | void | undefined,
): void {
  if (!result) {
    selection.clearSelection();
    return;
  }

  if (result.failedIds.length === 0) {
    selection.clearSelection();
    return;
  }

  // Keep only failed rows selected so the admin can retry.
  const failedIdSet = new Set(result.failedIds.map(String));
  selection.setSelectedIds(
    selection.selectedIds.filter((id) => failedIdSet.has(String(id))),
  );
}

export function useCrudTableBulkActions({
  selection,
  canDelete = true,
  onBulkDelete,
  isDeleting = false,
  extraActions,
  renderExtraActions,
}: UseCrudTableBulkActionsOptions) {
  const t = useTranslation();
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const handleBulkDeleteConfirm = useCallback(async () => {
    const result = await onBulkDelete(selection.selectedIds);
    applyBulkSelectionResult(selection, result);
    setBulkDeleteOpen(false);
  }, [onBulkDelete, selection]);

  const resolvedExtraActions = renderExtraActions?.() ?? extraActions;

  const tableSelectionProps = {
    enableSelection: true as const,
    selectedIds: selection.selectedIds,
    onSelectionChange: selection.setSelectedIds,
    selectAllLabel: t.selectAllRows,
    getSelectRowLabel: (id: string | number) => `${t.selectRow} ${id}`,
    bulkActions: selection.hasSelection ? (
      <CrudBulkActionBar
        selectedCount={selection.selectedIds.length}
        selectedLabel={t.selectedItems.replace("{count}", String(selection.selectedIds.length))}
        clearLabel={t.clearSelection}
        onClear={selection.clearSelection}
        actions={
          <>
            {resolvedExtraActions}
            {canDelete ? (
              <AppButton
                variant="destructive"
                size="sm"
                onClick={() => setBulkDeleteOpen(true)}
                disabled={isDeleting}
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
                {t.bulkDelete}
              </AppButton>
            ) : null}
          </>
        }
      />
    ) : undefined,
  };

  return {
    tableSelectionProps,
    bulkDeleteDialogProps: {
      open: bulkDeleteOpen,
      onOpenChange: setBulkDeleteOpen,
      selectedCount: selection.selectedIds.length,
      isLoading: isDeleting,
      onConfirm: handleBulkDeleteConfirm,
    },
  };
}
