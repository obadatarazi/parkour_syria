import { useCallback } from "react";

import { holidaysService } from "@/features/holidays/services/holidays.service";
import type { Holiday, HolidayFormData } from "@/features/holidays/types/holidays.types";
import {
  hasHolidayFormChanges,
  holidayToFormData,
  pickHolidayFormChanges,
} from "@/features/holidays/types/holidays.types";
import { type CrudSaveResult,useCrudMutation, useCrudQuickBooleanMutation } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type UseHolidayMutationsOptions = {
  onSuccess?: () => void | Promise<void>;
};

export type HolidayQuickToggleField = "isActive";

export function useHolidayMutations({ onSuccess }: UseHolidayMutationsOptions = {}) {
  const t = useTranslation();

  const createMutation = useCrudMutation({
    mutationFn: (data: HolidayFormData) => holidaysService.create(data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudCreateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const updateMutation = useCrudMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<HolidayFormData> }) =>
      holidaysService.update(id, data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudUpdateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const deleteMutation = useCrudMutation({
    mutationFn: (entity: Holiday) => holidaysService.delete(entity.id),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudDeleteSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const { quickToggle: quickToggleField } = useCrudQuickBooleanMutation<number>({
    updateFn: (id, data) => holidaysService.update(id, data),
  });

  const quickToggle = useCallback(
    (entity: Holiday, field: HolidayQuickToggleField, value: boolean) =>
      quickToggleField(entity.id, field, value),
    [quickToggleField],
  );

  const save = useCallback(
    async (
      mode: "create" | "edit",
      data: HolidayFormData,
      entity?: Holiday,
    ): Promise<CrudSaveResult | undefined> => {
      if (mode === "create") {
        await createMutation.mutate(data);
        return "saved";
      }
      if (!entity) return undefined;

      const original = holidayToFormData(entity);
      if (!hasHolidayFormChanges(original, data)) {
        return "skipped";
      }

      await updateMutation.mutate({
        id: entity.id,
        data: pickHolidayFormChanges(original, data),
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
