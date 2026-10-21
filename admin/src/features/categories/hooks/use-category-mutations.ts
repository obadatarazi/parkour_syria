import { useCallback } from "react";

import { categoriesService } from "@/features/categories/services/categories.service";
import type { Category, CategoryFormData } from "@/features/categories/types/categories.types";
import {
  categoryToFormData,
  hasCategoryFormChanges,
  pickCategoryFormChanges,
} from "@/features/categories/types/categories.types";
import {
  type CrudSaveResult,
  useCrudMutation,
  useCrudQuickBooleanMutation,
} from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type UseCategoryMutationsOptions = {
  onSuccess?: () => void | Promise<void>;
};

export type CategoryQuickToggleField = "publish" | "showMenu" | "showInHomePage" | "feature";

export function useCategoryMutations({ onSuccess }: UseCategoryMutationsOptions = {}) {
  const t = useTranslation();

  const createMutation = useCrudMutation({
    mutationFn: (data: CategoryFormData) => categoriesService.create(data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudCreateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const updateMutation = useCrudMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CategoryFormData> }) =>
      categoriesService.update(id, data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudUpdateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const deleteMutation = useCrudMutation({
    mutationFn: (category: Category) => categoriesService.delete(category.id),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudDeleteSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const { quickToggle: quickToggleField, isQuickToggling } = useCrudQuickBooleanMutation<number>({
    updateFn: (id, data) => categoriesService.update(id, data),
  });

  const quickToggle = useCallback(
    (category: Category, field: CategoryQuickToggleField, value: boolean) =>
      quickToggleField(category.id, field, value),
    [quickToggleField],
  );

  const save = useCallback(
    async (
      mode: "create" | "edit",
      data: CategoryFormData,
      entity?: Category,
    ): Promise<CrudSaveResult | undefined> => {
      if (mode === "create") {
        await createMutation.mutate(data);
        return "saved";
      }
      if (!entity) return undefined;

      const original = categoryToFormData(entity);
      if (!hasCategoryFormChanges(original, data)) {
        return "skipped";
      }

      await updateMutation.mutate({
        id: entity.id,
        data: pickCategoryFormChanges(original, data),
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
    isQuickToggling,
  };
}
