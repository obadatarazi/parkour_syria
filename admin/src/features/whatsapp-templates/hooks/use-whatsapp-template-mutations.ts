import { useCallback } from "react";

import { whatsappTemplatesService } from "@/features/whatsapp-templates/services/whatsapp-templates.service";
import type {
  WhatsAppTemplate,
  WhatsAppTemplateFormData,
} from "@/features/whatsapp-templates/types/whatsapp-templates.types";
import {
  hasWhatsAppTemplateFormChanges,
  whatsAppTemplateToFormData,
} from "@/features/whatsapp-templates/types/whatsapp-templates.types";
import { type CrudSaveResult, useCrudMutation } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type UseWhatsAppTemplateMutationsOptions = {
  onSuccess?: () => void | Promise<void>;
};

export function useWhatsAppTemplateMutations({
  onSuccess,
}: UseWhatsAppTemplateMutationsOptions = {}) {
  const t = useTranslation();

  const updateMutation = useCrudMutation({
    mutationFn: ({ event, data }: { event: string; data: WhatsAppTemplateFormData }) =>
      whatsappTemplatesService.update(event, data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudUpdateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess,
  });

  const toggleMutation = useCrudMutation({
    mutationFn: ({ event, data }: { event: string; data: WhatsAppTemplateFormData }) =>
      whatsappTemplatesService.update(event, data),
    feedback: {
      errorMessage: t.errorMessage,
    },
    onSuccess,
  });

  const syncMutation = useCrudMutation({
    mutationFn: () => whatsappTemplatesService.sync(),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.whatsappTemplateSynced,
      errorMessage: t.errorMessage,
      loadingMessage: t.whatsappTemplateSyncing,
    },
    onSuccess,
  });

  const previewMutation = useCrudMutation({
    mutationFn: ({
      event,
      parameters,
    }: {
      event: string;
      parameters?: Record<string, string>;
    }) => whatsappTemplatesService.preview(event, parameters),
    feedback: {
      errorMessage: t.errorMessage,
    },
  });

  const sendTestMutation = useCrudMutation({
    mutationFn: ({
      event,
      phone,
      parameters,
    }: {
      event: string;
      phone: string;
      parameters?: Record<string, string>;
    }) => whatsappTemplatesService.sendTest(event, phone, parameters),
    feedback: {
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
  });

  const quickToggle = useCallback(
    (entity: WhatsAppTemplate, _field: "isEnabled", value: boolean) =>
      toggleMutation.mutate({
        event: entity.event,
        data: {
          isEnabled: value,
          note: entity.note ?? "",
        },
      }),
    [toggleMutation],
  );

  const save = useCallback(
    async (
      data: WhatsAppTemplateFormData,
      entity: WhatsAppTemplate,
    ): Promise<CrudSaveResult | undefined> => {
      const original = whatsAppTemplateToFormData(entity);
      if (!hasWhatsAppTemplateFormChanges(original, data)) {
        return "skipped";
      }

      await updateMutation.mutate({ event: entity.event, data });
      return "saved";
    },
    [updateMutation],
  );

  return {
    updateMutation,
    syncMutation,
    previewMutation,
    sendTestMutation,
    quickToggle,
    save,
    isSaving: updateMutation.isPending,
    isSyncing: syncMutation.isPending,
    isPreviewing: previewMutation.isPending,
    isSendingTest: sendTestMutation.isPending,
  };
}
