import { useCallback } from "react";

import { tagsService } from "@/features/tags/services/tags.service";
import type { Tag, TagFormData } from "@/features/tags/types/tags.types";
import {
  hasTagFormChanges,
  pickTagFormChanges,
  tagToFormData,
} from "@/features/tags/types/tags.types";
import { useCrudMutation, useCrudQuickBooleanMutation, type CrudSaveResult } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type UseTagMutationsOptions = {
  onSuccess?: () => void | Promise<void>;
};

export type TagQuickToggleField = "publish";

export function useTagMutations({ onSuccess }: UseTagMutationsOptions = {}) {
  const t = useTranslation();

  const createMutation = useCrudMutation({
    mutationFn: (data: TagFormData) => tagsService.create(data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudCreateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const updateMutation = useCrudMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TagFormData> }) =>
      tagsService.update(id, data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudUpdateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const deleteMutation = useCrudMutation({
    mutationFn: (tag: Tag) => tagsService.delete(tag.id),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudDeleteSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const { quickToggle: quickToggleField } = useCrudQuickBooleanMutation<number>({
    updateFn: (id, data) => tagsService.update(id, data),
  });

  const quickToggle = useCallback(
    (tag: Tag, field: TagQuickToggleField, value: boolean) =>
      quickToggleField(tag.id, field, value),
    [quickToggleField],
  );

  const save = useCallback(
    async (
      mode: "create" | "edit",
      data: TagFormData,
      entity?: Tag,
    ): Promise<CrudSaveResult | undefined> => {
      if (mode === "create") {
        await createMutation.mutate(data);
        return "saved";
      }
      if (!entity) return undefined;

      const original = tagToFormData(entity);
      if (!hasTagFormChanges(original, data)) {
        return "skipped";
      }

      await updateMutation.mutate({
        id: entity.id,
        data: pickTagFormChanges(original, data),
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
