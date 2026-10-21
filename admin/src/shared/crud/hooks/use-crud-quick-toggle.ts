import { useCallback, useState } from "react";

import { isCrudMutationSuccess, type CrudMutationResult } from "@/shared/crud/types/crud.types";

type UseCrudQuickToggleOptions<T extends { id: string | number }> = {
  patchItems: (updater: (items: T[]) => T[]) => void;
  toggle: (
    entity: T,
    field: keyof T & string,
    value: boolean,
  ) => Promise<CrudMutationResult<unknown> | unknown | undefined>;
  /**
   * Optional extra optimistic/rollback patch for secondary stores
   * (e.g. nested category tree cache).
   */
  patchEntity?: (entity: T, field: keyof T & string, value: boolean) => void;
  /**
   * When set, replaces the default shallow `items.map(id === …)` optimistic
   * list patch (needed for nested trees where the row is not a root item).
   */
  applyListPatch?: (entity: T, field: keyof T & string, value: boolean) => void;
};

function didToggleFail(result: unknown): boolean {
  if (result === undefined) return true;
  if (
    typeof result === "object" &&
    result !== null &&
    "ok" in result &&
    typeof (result as { ok: unknown }).ok === "boolean"
  ) {
    return !isCrudMutationSuccess(result as CrudMutationResult<unknown>);
  }
  return false;
}

export function useCrudQuickToggle<T extends { id: string | number }>({
  patchItems,
  toggle,
  patchEntity,
  applyListPatch,
}: UseCrudQuickToggleOptions<T>) {
  const [toggling, setToggling] = useState<{
    id: T["id"];
    field: keyof T & string;
  } | null>(null);

  const handleToggle = useCallback(
    async (entity: T, field: keyof T & string, value: boolean) => {
      const previousValue = Boolean(entity[field]);

      if (applyListPatch) {
        applyListPatch(entity, field, value);
      } else {
        patchItems((items) =>
          items.map((item) => (item.id === entity.id ? { ...item, [field]: value } : item)),
        );
      }
      patchEntity?.(entity, field, value);

      setToggling({ id: entity.id, field });
      try {
        const result = await toggle(entity, field, value);
        if (didToggleFail(result)) {
          if (applyListPatch) {
            applyListPatch(entity, field, previousValue);
          } else {
            patchItems((items) =>
              items.map((item) =>
                item.id === entity.id ? { ...item, [field]: previousValue } : item,
              ),
            );
          }
          patchEntity?.(entity, field, previousValue);
        }
      } finally {
        setToggling(null);
      }
    },
    [applyListPatch, patchEntity, patchItems, toggle],
  );

  const isToggleLoading = useCallback(
    (id: T["id"], field: keyof T & string) => toggling?.id === id && toggling?.field === field,
    [toggling],
  );

  return {
    handleToggle,
    isToggleLoading,
  };
}
