import { useCallback } from "react";

import { visualSettingsService } from "@/features/visual-settings/services/visual-settings.service";
import type {
  VisualSetting,
  VisualSettingFormData,
} from "@/features/visual-settings/types/visual-settings.types";
import {
  hasVisualSettingFormChanges,
  pickVisualSettingFormChanges,
  visualSettingToFormData,
} from "@/features/visual-settings/types/visual-settings.types";
import { type CrudSaveResult,useCrudMutation } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type UseVisualSettingMutationsOptions = {
  onSuccess?: () => void | Promise<void>;
};

export function useVisualSettingMutations({ onSuccess }: UseVisualSettingMutationsOptions = {}) {
  const t = useTranslation();

  const updateMutation = useCrudMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<VisualSettingFormData> }) =>
      visualSettingsService.update(id, data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudUpdateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const save = useCallback(
    async (data: VisualSettingFormData, entity: VisualSetting): Promise<CrudSaveResult | undefined> => {
      const original = visualSettingToFormData(entity);
      if (!hasVisualSettingFormChanges(original, data)) {
        return "skipped";
      }

      await updateMutation.mutate({
        id: entity.id,
        data: pickVisualSettingFormChanges(original, data),
      });
      return "saved";
    },
    [updateMutation],
  );

  return {
    updateMutation,
    save,
    isSaving: updateMutation.isPending,
  };
}
