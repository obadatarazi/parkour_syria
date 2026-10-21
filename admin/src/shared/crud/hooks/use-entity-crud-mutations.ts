import { useCallback } from "react";

import { useCrudMutation } from "@/shared/crud/hooks/use-crud-mutation";
import { useCrudQuickBooleanMutation } from "@/shared/crud/hooks/use-crud-quick-boolean-mutation";
import type { CrudSaveResult } from "@/shared/crud/types/crud.types";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type EntityCrudService<TEntity, TForm> = {
  create?: (data: TForm) => Promise<TEntity>;
  update: (id: number, data: Partial<TForm>) => Promise<TEntity>;
  delete?: (id: number) => Promise<void>;
};

type UseEntityCrudMutationsOptions<TEntity extends { id: number }, TForm> = {
  service: EntityCrudService<TEntity, TForm>;
  toFormData: (entity: TEntity) => TForm;
  pickChanges: (original: TForm, current: TForm) => Partial<TForm>;
  onSuccess?: () => void | Promise<void>;
};

/**
 * Create / update / delete / quick-toggle for an overlay CRUD feature, the same behaviour every
 * `use-…-mutations` hook in this app has: toasts, and an edit that changed nothing is "skipped"
 * instead of sent.
 */
export function useEntityCrudMutations<TEntity extends { id: number }, TForm>({
  service,
  toFormData,
  pickChanges,
  onSuccess,
}: UseEntityCrudMutationsOptions<TEntity, TForm>) {
  const t = useTranslation();

  const feedback = (successDescription: string) => ({
    successMessage: t.successMessage,
    successDescription,
    errorMessage: t.errorMessage,
    loadingMessage: t.loadingMessage,
  });

  const createMutation = useCrudMutation({
    mutationFn: (data: TForm) => {
      if (!service.create) throw new Error("Create is not supported");
      return service.create(data);
    },
    feedback: feedback(t.crudCreateSuccess),
    onSuccess,
  });

  const updateMutation = useCrudMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TForm> }) => service.update(id, data),
    feedback: feedback(t.crudUpdateSuccess),
    onSuccess,
  });

  const deleteMutation = useCrudMutation({
    mutationFn: (entity: TEntity) => {
      if (!service.delete) throw new Error("Delete is not supported");
      return service.delete(entity.id);
    },
    feedback: feedback(t.crudDeleteSuccess),
    onSuccess,
  });

  const { quickToggle: quickToggleField } = useCrudQuickBooleanMutation<number>({
    updateFn: (id, data) => service.update(id, data as Partial<TForm>),
  });

  const quickToggle = useCallback(
    (entity: TEntity, field: string, value: boolean) => quickToggleField(entity.id, field, value),
    [quickToggleField],
  );

  const save = useCallback(
    async (
      mode: "create" | "edit",
      data: TForm,
      entity?: TEntity,
    ): Promise<CrudSaveResult | undefined> => {
      if (mode === "create") {
        const result = await createMutation.mutate(data);
        return result.ok ? "saved" : undefined;
      }
      if (!entity) return undefined;

      const changes = pickChanges(toFormData(entity), data);
      if (Object.keys(changes).length === 0) return "skipped";

      const result = await updateMutation.mutate({ id: entity.id, data: changes });
      return result.ok ? "saved" : undefined;
    },
    [createMutation, pickChanges, toFormData, updateMutation],
  );

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    quickToggle,
    save,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
