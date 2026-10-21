import { useCallback } from "react";

import { loyaltyEventsService } from "@/features/loyalty-events/services/loyalty-events.service";
import type {
  LoyaltyEvent,
  LoyaltyEventFormData,
} from "@/features/loyalty-events/types/loyalty-events.types";
import {
  hasLoyaltyEventFormChanges,
  loyaltyEventToFormData,
  pickLoyaltyEventFormChanges,
} from "@/features/loyalty-events/types/loyalty-events.types";
import { useCrudMutation, useCrudQuickBooleanMutation, type CrudSaveResult } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type UseLoyaltyEventMutationsOptions = {
  onSuccess?: () => void | Promise<void>;
};

export type LoyaltyEventQuickToggleField = "isActive";

export function useLoyaltyEventMutations({ onSuccess }: UseLoyaltyEventMutationsOptions = {}) {
  const t = useTranslation();

  const createMutation = useCrudMutation({
    mutationFn: (data: LoyaltyEventFormData) => loyaltyEventsService.create(data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudCreateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const updateMutation = useCrudMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<LoyaltyEventFormData> }) =>
      loyaltyEventsService.update(id, data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudUpdateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const deleteMutation = useCrudMutation({
    mutationFn: (event: LoyaltyEvent) => loyaltyEventsService.delete(event.id),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudDeleteSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const { quickToggle: quickToggleField } = useCrudQuickBooleanMutation<number>({
    updateFn: (id, data) => loyaltyEventsService.update(id, data),
  });

  const quickToggle = useCallback(
    (event: LoyaltyEvent, field: LoyaltyEventQuickToggleField, value: boolean) =>
      quickToggleField(event.id, field, value),
    [quickToggleField],
  );

  const save = useCallback(
    async (
      mode: "create" | "edit",
      data: LoyaltyEventFormData,
      entity?: LoyaltyEvent,
    ): Promise<CrudSaveResult | undefined> => {
      if (mode === "create") {
        await createMutation.mutate(data);
        return "saved";
      }
      if (!entity) return undefined;

      const original = loyaltyEventToFormData(entity);
      if (!hasLoyaltyEventFormChanges(original, data)) {
        return "skipped";
      }

      await updateMutation.mutate({
        id: entity.id,
        data: pickLoyaltyEventFormChanges(original, data),
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
