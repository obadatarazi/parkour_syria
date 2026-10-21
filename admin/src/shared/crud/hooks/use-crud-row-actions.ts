import { Eye, Pencil, Trash2 } from "lucide-react";
import { useMemo } from "react";

import type { CrudDialogState, CrudRowAction } from "@/shared/crud/types/crud.types";
import type { Translation } from "@/shared/design-system/localization/locales/en";

type UseCrudRowActionsOptions<TEntity> = {
  dialog: CrudDialogState<TEntity>;
  canUpdate: boolean;
  canDelete: boolean;
  t: Translation;
  /** Set to false to omit the View action (defaults to true). */
  includeView?: boolean;
};

/**
 * Builds the standard View/Edit/Delete row actions for a CRUD table, always
 * including View and permission-gating Edit/Delete, matching the
 * Categories/Brands pattern.
 */
export function useCrudRowActions<TEntity>({
  dialog,
  canUpdate,
  canDelete,
  t,
  includeView = true,
}: UseCrudRowActionsOptions<TEntity>): CrudRowAction<TEntity>[] {
  return useMemo(() => {
    const actions: CrudRowAction<TEntity>[] = [];

    if (includeView) {
      actions.push({
        id: "view",
        label: t.viewAction,
        icon: Eye,
        onSelect: (entity) => dialog.openView(entity),
      });
    }

    if (canUpdate) {
      actions.push({
        id: "edit",
        label: t.editAction,
        icon: Pencil,
        onSelect: (entity) => dialog.openEdit(entity),
      });
    }

    if (canDelete) {
      actions.push({
        id: "delete",
        label: t.deleteAction,
        icon: Trash2,
        variant: "destructive",
        onSelect: (entity) => dialog.openDelete(entity),
      });
    }

    return actions;
  }, [canDelete, canUpdate, dialog, includeView, t]);
}
