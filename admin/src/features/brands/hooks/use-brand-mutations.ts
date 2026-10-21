import { useCallback } from "react";

import { brandsService } from "@/features/brands/services/brands.service";
import type { Brand, BrandFormData } from "@/features/brands/types/brands.types";
import {
  brandToFormData,
  hasBrandFormChanges,
  pickBrandFormChanges,
} from "@/features/brands/types/brands.types";
import { useCrudMutation, useCrudQuickBooleanMutation, type CrudSaveResult } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type UseBrandMutationsOptions = {
  onSuccess?: () => void | Promise<void>;
};

export type BrandQuickToggleField = "publish";

export function useBrandMutations({ onSuccess }: UseBrandMutationsOptions = {}) {
  const t = useTranslation();

  const createMutation = useCrudMutation({
    mutationFn: (data: BrandFormData) => brandsService.create(data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudCreateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const updateMutation = useCrudMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<BrandFormData> }) =>
      brandsService.update(id, data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudUpdateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const deleteMutation = useCrudMutation({
    mutationFn: (brand: Brand) => brandsService.delete(brand.id),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudDeleteSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const { quickToggle: quickToggleField } = useCrudQuickBooleanMutation<number>({
    updateFn: (id, data) => brandsService.update(id, data),
  });

  const quickToggle = useCallback(
    (brand: Brand, field: BrandQuickToggleField, value: boolean) =>
      quickToggleField(brand.id, field, value),
    [quickToggleField],
  );

  const save = useCallback(
    async (
      mode: "create" | "edit",
      data: BrandFormData,
      entity?: Brand,
    ): Promise<CrudSaveResult | undefined> => {
      if (mode === "create") {
        await createMutation.mutate(data);
        return "saved";
      }
      if (!entity) return undefined;

      const original = brandToFormData(entity);
      if (!hasBrandFormChanges(original, data)) {
        return "skipped";
      }

      await updateMutation.mutate({
        id: entity.id,
        data: pickBrandFormChanges(original, data),
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
