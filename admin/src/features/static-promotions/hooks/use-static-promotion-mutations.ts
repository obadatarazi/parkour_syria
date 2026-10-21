import { useCallback } from "react";

import { staticPromotionsService } from "@/features/static-promotions/services/static-promotions.service";
import type { StaticPromotion, StaticPromotionFormData } from "@/features/static-promotions/types/static-promotions.types";
import {
  hasStaticPromotionFormChanges,
  pickStaticPromotionFormChanges,
  staticPromotionToFormData,
} from "@/features/static-promotions/types/static-promotions.types";
import { type CrudSaveResult,useCrudMutation, useCrudQuickBooleanMutation } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type UseStaticPromotionMutationsOptions = {
  onSuccess?: () => void | Promise<void>;
};

export type StaticPromotionQuickToggleField = "publish";

export function useStaticPromotionMutations({ onSuccess }: UseStaticPromotionMutationsOptions = {}) {
  const t = useTranslation();

  const createMutation = useCrudMutation({
    mutationFn: (data: StaticPromotionFormData) => staticPromotionsService.create(data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudCreateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const updateMutation = useCrudMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<StaticPromotionFormData> }) =>
      staticPromotionsService.update(id, data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudUpdateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const deleteMutation = useCrudMutation({
    mutationFn: (promotion: StaticPromotion) => staticPromotionsService.delete(promotion.id),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudDeleteSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const { quickToggle: quickToggleField } = useCrudQuickBooleanMutation<number>({
    updateFn: (id, data) => staticPromotionsService.update(id, data),
  });

  const quickToggle = useCallback(
    (promotion: StaticPromotion, field: StaticPromotionQuickToggleField, value: boolean) =>
      quickToggleField(promotion.id, field, value),
    [quickToggleField],
  );

  const save = useCallback(
    async (
      mode: "create" | "edit",
      data: StaticPromotionFormData,
      entity?: StaticPromotion,
    ): Promise<CrudSaveResult | undefined> => {
      if (mode === "create") {
        await createMutation.mutate(data);
        return "saved";
      }
      if (!entity) return undefined;

      const original = staticPromotionToFormData(entity);
      if (!hasStaticPromotionFormChanges(original, data)) {
        return "skipped";
      }

      await updateMutation.mutate({
        id: entity.id,
        data: pickStaticPromotionFormChanges(original, data),
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
