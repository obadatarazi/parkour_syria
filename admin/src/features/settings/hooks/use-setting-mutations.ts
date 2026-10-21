import { useCallback } from "react";

import { settingsService } from "@/features/settings/services/settings.service";
import type { MultiTypeSetting, MultiTypeSettingFormData } from "@/features/settings/types/settings.types";
import {
  hasSettingFormChanges,
  pickSettingFormChanges,
  settingToFormData,
} from "@/features/settings/types/settings.types";
import { type CrudSaveResult,useCrudMutation } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type UseSettingMutationsOptions = {
  onSuccess?: () => void | Promise<void>;
};

export function useSettingMutations({ onSuccess }: UseSettingMutationsOptions = {}) {
  const t = useTranslation();

  const createMutation = useCrudMutation({
    mutationFn: (data: MultiTypeSettingFormData) => settingsService.create(data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudCreateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const updateMutation = useCrudMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<MultiTypeSettingFormData> }) =>
      settingsService.update(id, data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudUpdateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const deleteMutation = useCrudMutation({
    mutationFn: (setting: MultiTypeSetting) => settingsService.delete(setting.id),
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
      data: MultiTypeSettingFormData,
      entity?: MultiTypeSetting,
    ): Promise<CrudSaveResult | undefined> => {
      if (mode === "create") {
        await createMutation.mutate(data);
        return "saved";
      }
      if (!entity) return undefined;

      const original = settingToFormData(entity);
      if (!hasSettingFormChanges(original, data)) {
        return "skipped";
      }

      await updateMutation.mutate({
        id: entity.id,
        data: pickSettingFormChanges(original, data),
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
