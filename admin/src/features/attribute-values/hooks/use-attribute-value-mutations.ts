import { useCallback } from "react";

import { attributeValuesService } from "@/features/attribute-values/services/attribute-values.service";
import type {
  AttributeValue,
  AttributeValueFormData,
} from "@/features/attribute-values/types/attribute-values.types";
import {
  attributeValueToFormData,
  hasAttributeValueFormChanges,
  pickAttributeValueFormChanges,
} from "@/features/attribute-values/types/attribute-values.types";
import { useCrudMutation, useCrudQuickBooleanMutation, type CrudSaveResult } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type UseAttributeValueMutationsOptions = {
  onSuccess?: () => void | Promise<void>;
};

export type AttributeValueQuickToggleField = "publish";

export function useAttributeValueMutations({ onSuccess }: UseAttributeValueMutationsOptions = {}) {
  const t = useTranslation();

  const createMutation = useCrudMutation({
    mutationFn: (data: AttributeValueFormData) => attributeValuesService.create(data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudCreateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const updateMutation = useCrudMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AttributeValueFormData> }) =>
      attributeValuesService.update(id, data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudUpdateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const deleteMutation = useCrudMutation({
    mutationFn: (attributeValue: AttributeValue) => attributeValuesService.delete(attributeValue.id),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudDeleteSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const { quickToggle: quickToggleField } = useCrudQuickBooleanMutation<number>({
    updateFn: (id, data) => attributeValuesService.update(id, data),
  });

  const quickToggle = useCallback(
    (attributeValue: AttributeValue, field: AttributeValueQuickToggleField, value: boolean) =>
      quickToggleField(attributeValue.id, field, value),
    [quickToggleField],
  );

  const save = useCallback(
    async (
      mode: "create" | "edit",
      data: AttributeValueFormData,
      entity?: AttributeValue,
    ): Promise<CrudSaveResult | undefined> => {
      if (mode === "create") {
        await createMutation.mutate(data);
        return "saved";
      }
      if (!entity) return undefined;

      const original = attributeValueToFormData(entity);
      if (!hasAttributeValueFormChanges(original, data)) {
        return "skipped";
      }

      await updateMutation.mutate({
        id: entity.id,
        data: pickAttributeValueFormChanges(original, data),
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
