import { useCallback } from "react";

import { promotionsService } from "@/features/promotions/services/promotions.service";
import type { Promotion, PromotionFormData } from "@/features/promotions/types/promotions.types";
import {
  hasPromotionFormChanges,
  pickPromotionFormChanges,
  promotionToFormData,
} from "@/features/promotions/types/promotions.types";
import {
  type CrudSaveResult,
  invalidateQueryCache,
  setCachedQueryData,
  useCrudMutation,
} from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type UsePromotionMutationsOptions = {
  onSuccess?: () => void | Promise<void>;
};

function cachePromotionDetail(promotion: Promotion) {
  setCachedQueryData(["promotions", "detail", String(promotion.id)], promotion);
}

function invalidatePromotionQueries() {
  invalidateQueryCache("promotions", { skipPrefix: "promotions:detail:" });
  invalidateQueryCache("bogo-promotions");
  invalidateQueryCache("promotion-usages");
}

async function afterPromotionMutation(
  promotion?: Promotion,
  onSuccess?: () => void | Promise<void>,
) {
  invalidatePromotionQueries();
  if (promotion) {
    cachePromotionDetail(promotion);
  }
  await onSuccess?.();
}

export function usePromotionMutations({ onSuccess }: UsePromotionMutationsOptions = {}) {
  const t = useTranslation();

  const createMutation = useCrudMutation({
    mutationFn: (data: PromotionFormData) => promotionsService.create(data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudCreateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess: async (promotion) => {
      await afterPromotionMutation(promotion, onSuccess);
    },
  });

  const updateMutation = useCrudMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PromotionFormData> }) =>
      promotionsService.update(id, data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudUpdateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess: async (promotion) => {
      await afterPromotionMutation(promotion, onSuccess);
    },
  });

  const deleteMutation = useCrudMutation({
    mutationFn: (entity: Promotion) => promotionsService.delete(entity.id),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudDeleteSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess: async () => {
      await afterPromotionMutation(undefined, onSuccess);
    },
  });

  const save = useCallback(
    async (
      mode: "create" | "edit",
      data: PromotionFormData,
      entity?: Promotion,
      originalForm?: PromotionFormData,
    ): Promise<{ status: CrudSaveResult; promotion?: Promotion } | undefined> => {
      if (mode === "create") {
        const result = await createMutation.mutate(data);
        if (!result.ok) return undefined;
        return { status: "saved" as const, promotion: result.data };
      }
      if (!entity) return undefined;

      const original = originalForm ?? promotionToFormData(entity);
      if (!hasPromotionFormChanges(original, data)) {
        return { status: "skipped" as const };
      }

      const result = await updateMutation.mutate({
        id: entity.id,
        data: pickPromotionFormChanges(original, data),
      });
      if (!result.ok) return undefined;
      return { status: "saved" as const, promotion: result.data };
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
