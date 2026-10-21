import { useCallback, useState } from "react";

import type { CrudSelectionState } from "@/shared/crud/types/crud.types";

export function useCrudSelection<
  TId extends string | number = string | number,
>(): CrudSelectionState<TId> {
  const [selectedIds, setSelectedIds] = useState<TId[]>([]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  return {
    selectedIds,
    setSelectedIds,
    clearSelection,
    hasSelection: selectedIds.length > 0,
  };
}
