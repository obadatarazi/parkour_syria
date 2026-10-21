import { useCallback } from "react";

import { productReviewsService } from "@/features/product-reviews/services/product-reviews.service";
import type {
  ProductReview,
  ProductReviewFormData,
} from "@/features/product-reviews/types/product-reviews.types";
import {
  hasProductReviewFormChanges,
  pickProductReviewFormChanges,
  productReviewToFormData,
} from "@/features/product-reviews/types/product-reviews.types";
import { type CrudSaveResult,useCrudMutation } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type UseProductReviewMutationsOptions = {
  productId: number;
  onSuccess?: () => void | Promise<void>;
};

export function useProductReviewMutations({
  productId,
  onSuccess,
}: UseProductReviewMutationsOptions) {
  const t = useTranslation();

  const createMutation = useCrudMutation({
    mutationFn: (data: ProductReviewFormData) => productReviewsService.create(productId, data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudCreateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const updateMutation = useCrudMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ProductReviewFormData> }) =>
      productReviewsService.update(productId, id, data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudUpdateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const deleteMutation = useCrudMutation({
    mutationFn: (review: ProductReview) => productReviewsService.delete(productId, review.id),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudDeleteSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const save = useCallback(
    async (
      mode: "create" | "edit",
      data: ProductReviewFormData,
      entity?: ProductReview,
    ): Promise<CrudSaveResult | undefined> => {
      if (mode === "create") {
        await createMutation.mutate(data);
        return "saved";
      }
      if (!entity) return undefined;

      const original = productReviewToFormData(entity);
      if (!hasProductReviewFormChanges(original, data)) {
        return "skipped";
      }

      await updateMutation.mutate({
        id: entity.id,
        data: pickProductReviewFormChanges(original, data),
      });
      return "saved";
    },
    [createMutation, updateMutation],
  );

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    save,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
