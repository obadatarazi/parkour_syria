import { useCallback } from "react";

import { attributesService } from "@/features/attributes/services/attributes.service";
import type { Attribute, AttributeFormData } from "@/features/attributes/types/attributes.types";
import {
  attributeToFormData,
  hasAttributeFormChanges,
  pickAttributeFormChanges,
} from "@/features/attributes/types/attributes.types";
import { useCrudMutation, useCrudQuickBooleanMutation, type CrudSaveResult } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type UseAttributeMutationsOptions = {
  onSuccess?: () => void | Promise<void>;
};

export type AttributeQuickToggleField = "publish";

export function useAttributeMutations({ onSuccess }: UseAttributeMutationsOptions = {}) {
  const t = useTranslation();

  const createMutation = useCrudMutation({
    mutationFn: (data: AttributeFormData) => attributesService.create(data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudCreateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const updateMutation = useCrudMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AttributeFormData> }) =>
      attributesService.update(id, data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudUpdateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const deleteMutation = useCrudMutation({
    mutationFn: (attribute: Attribute) => attributesService.delete(attribute.id),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudDeleteSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const { quickToggle: quickToggleField } = useCrudQuickBooleanMutation<number>({
    updateFn: (id, data) => attributesService.update(id, data),
  });

  const quickToggle = useCallback(
    (attribute: Attribute, field: AttributeQuickToggleField, value: boolean) =>
      quickToggleField(attribute.id, field, value),
    [quickToggleField],
  );

  const save = useCallback(
    async (
      mode: "create" | "edit",
      data: AttributeFormData,
      entity?: Attribute,
    ): Promise<CrudSaveResult | undefined> => {
      if (mode === "create") {
        await createMutation.mutate(data);
        return "saved";
      }
      if (!entity) return undefined;

      const original = attributeToFormData(entity);
      if (!hasAttributeFormChanges(original, data)) {
        return "skipped";
      }

      await updateMutation.mutate({
        id: entity.id,
        data: pickAttributeFormChanges(original, data),
      });
      return "saved";
    },
    [createMutation, updateMutation],
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
