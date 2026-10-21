import { useCallback } from "react";

import { contactUsService } from "@/features/contact-us/services/contact-us.service";
import type {
  ContactUsFormData,
  ContactUsMessage,
} from "@/features/contact-us/types/contact-us.types";
import {
  contactUsToFormData,
  hasContactUsFormChanges,
  pickContactUsFormChanges,
} from "@/features/contact-us/types/contact-us.types";
import { useCrudMutation, type CrudSaveResult } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type UseContactUsMutationsOptions = {
  onSuccess?: () => void | Promise<void>;
};

export function useContactUsMutations({ onSuccess }: UseContactUsMutationsOptions = {}) {
  const t = useTranslation();

  const updateMutation = useCrudMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ContactUsFormData> }) =>
      contactUsService.update(id, data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudUpdateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const deleteMutation = useCrudMutation({
    mutationFn: (message: ContactUsMessage) => contactUsService.delete(message.id),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudDeleteSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const save = useCallback(
    async (data: ContactUsFormData, entity: ContactUsMessage): Promise<CrudSaveResult | undefined> => {
      const original = contactUsToFormData(entity);
      if (!hasContactUsFormChanges(original, data)) {
        return "skipped";
      }

      await updateMutation.mutate({
        id: entity.id,
        data: pickContactUsFormChanges(original, data),
      });
      return "saved";
    },
    [updateMutation],
  );

  return {
    updateMutation,
    deleteMutation,
    save,
    isSaving: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
