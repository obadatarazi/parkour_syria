import { useCallback, useMemo, useState } from "react";

import type { CrudDialogMode, CrudDialogState } from "@/shared/crud/types/crud.types";

export function useCrudDialog<TEntity>(): CrudDialogState<TEntity> {
  const [mode, setMode] = useState<CrudDialogMode>(null);
  const [entity, setEntity] = useState<TEntity | null>(null);

  const openCreate = useCallback(() => {
    setEntity(null);
    setMode("create");
  }, []);

  const openEdit = useCallback((nextEntity: TEntity) => {
    setEntity(nextEntity);
    setMode("edit");
  }, []);

  const openView = useCallback((nextEntity: TEntity) => {
    setEntity(nextEntity);
    setMode("view");
  }, []);

  const openDelete = useCallback((nextEntity: TEntity) => {
    setEntity(nextEntity);
    setMode("delete");
  }, []);

  const close = useCallback(() => {
    setMode(null);
    setEntity(null);
  }, []);

  return useMemo(
    () => ({
      mode,
      entity,
      openCreate,
      openEdit,
      openView,
      openDelete,
      close,
      isOpen: mode !== null,
    }),
    [mode, entity, openCreate, openEdit, openView, openDelete, close],
  );
}
