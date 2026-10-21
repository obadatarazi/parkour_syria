import { useCallback } from "react";

import { sliderPromotionsService } from "@/features/slider-promotions/services/slider-promotions.service";
import type { SliderPromotion, SliderPromotionFormData } from "@/features/slider-promotions/types/slider-promotions.types";
import {
  hasSliderPromotionFormChanges,
  pickSliderPromotionFormChanges,
  sliderPromotionToFormData,
} from "@/features/slider-promotions/types/slider-promotions.types";
import { useCrudMutation, useCrudQuickBooleanMutation, type CrudSaveResult } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type UseSliderPromotionMutationsOptions = {
  onSuccess?: () => void | Promise<void>;
};

export type SliderPromotionQuickToggleField = "publish";

export function useSliderPromotionMutations({ onSuccess }: UseSliderPromotionMutationsOptions = {}) {
  const t = useTranslation();

  const createMutation = useCrudMutation({
    mutationFn: (data: SliderPromotionFormData) => sliderPromotionsService.create(data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudCreateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const updateMutation = useCrudMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<SliderPromotionFormData> }) =>
      sliderPromotionsService.update(id, data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudUpdateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const deleteMutation = useCrudMutation({
    mutationFn: (promotion: SliderPromotion) => sliderPromotionsService.delete(promotion.id),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudDeleteSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const { quickToggle: quickToggleField } = useCrudQuickBooleanMutation<number>({
    updateFn: (id, data) => sliderPromotionsService.update(id, data),
  });

  const quickToggle = useCallback(
    (promotion: SliderPromotion, field: SliderPromotionQuickToggleField, value: boolean) =>
      quickToggleField(promotion.id, field, value),
    [quickToggleField],
  );

  const save = useCallback(
    async (
      mode: "create" | "edit",
      data: SliderPromotionFormData,
      entity?: SliderPromotion,
    ): Promise<CrudSaveResult | undefined> => {
      if (mode === "create") {
        await createMutation.mutate(data);
        return "saved";
      }
      if (!entity) return undefined;

      const original = sliderPromotionToFormData(entity);
      if (!hasSliderPromotionFormChanges(original, data)) {
        return "skipped";
      }

      await updateMutation.mutate({
        id: entity.id,
        data: pickSliderPromotionFormChanges(original, data),
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
