import { useCallback } from "react";

import { loyaltyRewardsService } from "@/features/loyalty-rewards/services/loyalty-rewards.service";
import type {
  LoyaltyReward,
  LoyaltyRewardFormData,
} from "@/features/loyalty-rewards/types/loyalty-rewards.types";
import {
  hasLoyaltyRewardFormChanges,
  loyaltyRewardToFormData,
  pickLoyaltyRewardFormChanges,
} from "@/features/loyalty-rewards/types/loyalty-rewards.types";
import { type CrudSaveResult,useCrudMutation, useCrudQuickBooleanMutation } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type UseLoyaltyRewardMutationsOptions = {
  onSuccess?: () => void | Promise<void>;
};

export type LoyaltyRewardQuickToggleField = "isActive";

export function useLoyaltyRewardMutations({ onSuccess }: UseLoyaltyRewardMutationsOptions = {}) {
  const t = useTranslation();

  const createMutation = useCrudMutation({
    mutationFn: (data: LoyaltyRewardFormData) => loyaltyRewardsService.create(data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudCreateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const updateMutation = useCrudMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<LoyaltyRewardFormData> }) =>
      loyaltyRewardsService.update(id, data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudUpdateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const deleteMutation = useCrudMutation({
    mutationFn: (reward: LoyaltyReward) => loyaltyRewardsService.delete(reward.id),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudDeleteSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const { quickToggle: quickToggleField } = useCrudQuickBooleanMutation<number>({
    updateFn: (id, data) => loyaltyRewardsService.update(id, data),
  });

  const quickToggle = useCallback(
    (reward: LoyaltyReward, field: LoyaltyRewardQuickToggleField, value: boolean) =>
      quickToggleField(reward.id, field, value),
    [quickToggleField],
  );

  const save = useCallback(
    async (
      mode: "create" | "edit",
      data: LoyaltyRewardFormData,
      entity?: LoyaltyReward,
    ): Promise<CrudSaveResult | undefined> => {
      if (mode === "create") {
        await createMutation.mutate(data);
        return "saved";
      }
      if (!entity) return undefined;

      const original = loyaltyRewardToFormData(entity);
      if (!hasLoyaltyRewardFormChanges(original, data)) {
        return "skipped";
      }

      await updateMutation.mutate({
        id: entity.id,
        data: pickLoyaltyRewardFormChanges(original, data),
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
