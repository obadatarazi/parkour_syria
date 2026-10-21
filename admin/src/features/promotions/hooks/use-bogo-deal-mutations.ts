import { bogoConditionsService } from "@/features/promotions/services/bogo-conditions.service";
import { bogoPromotionsService } from "@/features/promotions/services/bogo-promotions.service";
import { bogoRewardsService } from "@/features/promotions/services/bogo-rewards.service";
import type {
  BogoCondition,
  BogoConditionFormData,
  BogoPromotion,
  BogoPromotionFormData,
  BogoReward,
  BogoRewardFormData,
} from "@/features/promotions/types/promotions.types";
import { invalidateQueryCache, useCrudMutation } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type Options = {
  promotionId: number;
  onSuccess?: () => void | Promise<void>;
};

async function afterBogoChange(_promotionId: number, onSuccess?: () => void | Promise<void>) {
  invalidateQueryCache("bogo-promotions");
  invalidateQueryCache("bogo-conditions");
  invalidateQueryCache("bogo-rewards");
  invalidateQueryCache("promotions");
  await onSuccess?.();
}

export function useBogoDealMutations({ promotionId, onSuccess }: Options) {
  const t = useTranslation();

  const createDeal = useCrudMutation({
    mutationFn: (data: BogoPromotionFormData) => bogoPromotionsService.create(data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudCreateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess: async () => afterBogoChange(promotionId, onSuccess),
  });

  const updateDeal = useCrudMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<BogoPromotionFormData> }) =>
      bogoPromotionsService.update(id, data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudUpdateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess: async () => afterBogoChange(promotionId, onSuccess),
  });

  const deleteDeal = useCrudMutation({
    mutationFn: (entity: BogoPromotion) => bogoPromotionsService.delete(entity.id),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudDeleteSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess: async () => afterBogoChange(promotionId, onSuccess),
  });

  const createCondition = useCrudMutation({
    mutationFn: (data: BogoConditionFormData) => bogoConditionsService.create(data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudCreateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess: async () => afterBogoChange(promotionId, onSuccess),
  });

  const updateCondition = useCrudMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<BogoConditionFormData> }) =>
      bogoConditionsService.update(id, data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudUpdateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess: async () => afterBogoChange(promotionId, onSuccess),
  });

  const deleteCondition = useCrudMutation({
    mutationFn: (entity: BogoCondition) => bogoConditionsService.delete(entity.id),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudDeleteSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess: async () => afterBogoChange(promotionId, onSuccess),
  });

  const createReward = useCrudMutation({
    mutationFn: (data: BogoRewardFormData) => bogoRewardsService.create(data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudCreateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess: async () => afterBogoChange(promotionId, onSuccess),
  });

  const updateReward = useCrudMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<BogoRewardFormData> }) =>
      bogoRewardsService.update(id, data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudUpdateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess: async () => afterBogoChange(promotionId, onSuccess),
  });

  const deleteReward = useCrudMutation({
    mutationFn: (entity: BogoReward) => bogoRewardsService.delete(entity.id),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudDeleteSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess: async () => afterBogoChange(promotionId, onSuccess),
  });

  return {
    createDeal,
    updateDeal,
    deleteDeal,
    createCondition,
    updateCondition,
    deleteCondition,
    createReward,
    updateReward,
    deleteReward,
    isSaving:
      createDeal.isPending ||
      updateDeal.isPending ||
      createCondition.isPending ||
      updateCondition.isPending ||
      createReward.isPending ||
      updateReward.isPending,
    isDeleting:
      deleteDeal.isPending || deleteCondition.isPending || deleteReward.isPending,
  };
}
