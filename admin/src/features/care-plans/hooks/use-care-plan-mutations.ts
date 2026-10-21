import { useCallback } from "react";

import { carePlansService } from "@/features/care-plans/services/care-plans.service";
import type { CarePlan, CarePlanFormData } from "@/features/care-plans/types/care-plans.types";
import {
  carePlanToFormData,
  hasCarePlanFormChanges,
  pickCarePlanFormChanges,
} from "@/features/care-plans/types/care-plans.types";
import {
  invalidateQueryCache,
  setCachedQueryData,
  useCrudMutation,
  type CrudSaveResult,
} from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type UseCarePlanMutationsOptions = {
  onSuccess?: () => void | Promise<void>;
};

function cacheCarePlanDetail(plan: CarePlan) {
  setCachedQueryData(["care-plans", "detail", String(plan.id)], plan);
}

function invalidateCarePlanQueries() {
  invalidateQueryCache("care-plans", { skipPrefix: "care-plans:detail:" });
}

async function afterCarePlanMutation(
  plan?: CarePlan,
  onSuccess?: () => void | Promise<void>,
) {
  invalidateCarePlanQueries();
  if (plan) {
    cacheCarePlanDetail(plan);
  }
  await onSuccess?.();
}

export function useCarePlanMutations({ onSuccess }: UseCarePlanMutationsOptions = {}) {
  const t = useTranslation();

  const createMutation = useCrudMutation({
    mutationFn: (data: CarePlanFormData) => carePlansService.create(data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudCreateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess: async (plan) => {
      await afterCarePlanMutation(plan, onSuccess);
    },
  });

  const updateMutation = useCrudMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CarePlanFormData> }) =>
      carePlansService.update(id, data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudUpdateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess: async (plan) => {
      await afterCarePlanMutation(plan, onSuccess);
    },
  });

  const deleteMutation = useCrudMutation({
    mutationFn: (entity: CarePlan) => carePlansService.delete(entity.id),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.carePlanCancelSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess: async () => {
      await afterCarePlanMutation(undefined, onSuccess);
    },
  });

  const pauseMutation = useCrudMutation({
    mutationFn: (entity: CarePlan) => carePlansService.pause(entity.id),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.carePlanPauseSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess: async (plan) => {
      await afterCarePlanMutation(plan, onSuccess);
    },
  });

  const resumeMutation = useCrudMutation({
    mutationFn: (entity: CarePlan) => carePlansService.resume(entity.id),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.carePlanResumeSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess: async (plan) => {
      await afterCarePlanMutation(plan, onSuccess);
    },
  });

  const cancelMutation = useCrudMutation({
    mutationFn: (entity: CarePlan) => carePlansService.cancel(entity.id),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.carePlanCancelSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess: async (plan) => {
      await afterCarePlanMutation(plan, onSuccess);
    },
  });

  const skipCycleMutation = useCrudMutation({
    mutationFn: ({ carePlanId, cycleId }: { carePlanId: number; cycleId: number }) =>
      carePlansService.skipCycle(carePlanId, cycleId),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.carePlanSkipCycleSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess: async (plan) => {
      await afterCarePlanMutation(plan, onSuccess);
    },
  });

  const save = useCallback(
    async (
      mode: "create" | "edit",
      data: CarePlanFormData,
      entity?: CarePlan,
      originalForm?: CarePlanFormData,
    ): Promise<{ status: CrudSaveResult; carePlan?: CarePlan } | undefined> => {
      if (mode === "create") {
        const result = await createMutation.mutate(data);
        if (!result.ok) return undefined;
        return { status: "saved" as const, carePlan: result.data };
      }
      if (!entity) return undefined;

      const original = originalForm ?? carePlanToFormData(entity);
      if (!hasCarePlanFormChanges(original, data)) {
        return { status: "skipped" as const };
      }

      const result = await updateMutation.mutate({
        id: entity.id,
        data: pickCarePlanFormChanges(original, data),
      });
      if (!result.ok) return undefined;
      return { status: "saved" as const, carePlan: result.data };
    },
    [createMutation, updateMutation],
  );

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    pauseMutation,
    resumeMutation,
    cancelMutation,
    skipCycleMutation,
    save,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isLifecyclePending:
      pauseMutation.isPending || resumeMutation.isPending || cancelMutation.isPending,
    isSkippingCycle: skipCycleMutation.isPending,
  };
}
