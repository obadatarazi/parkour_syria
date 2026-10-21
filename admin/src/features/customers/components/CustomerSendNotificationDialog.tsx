import { useEffect, useState } from "react";

import type { CrmSendNotificationInput } from "@/features/customers/types/customers.types";
import { NotificationTranslationFields } from "@/features/notifications/components/NotificationTranslationFields";
import type { NotificationTranslations } from "@/features/notifications/types/notifications.types";
import { AppButton, AppDialog, SelectField } from "@/shared/components";
import { useNotificationTypeOptions } from "@/shared/hooks/use-options";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type CustomerSendNotificationDialogProps = {
  open: boolean;
  isSaving?: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (input: CrmSendNotificationInput) => Promise<boolean>;
};

const EMPTY_TRANSLATIONS: NotificationTranslations = {
  en: { title: "", body: "" },
  ar: { title: "", body: "" },
};

export function CustomerSendNotificationDialog({
  open,
  isSaving = false,
  onOpenChange,
  onSend,
}: CustomerSendNotificationDialogProps) {
  const t = useTranslation();
  const { options: typeOptions } = useNotificationTypeOptions();
  const [type, setType] = useState("");
  const [translations, setTranslations] = useState<NotificationTranslations>(EMPTY_TRANSLATIONS);
  const [titleErrors, setTitleErrors] = useState<Partial<Record<"en" | "ar", string>>>({});

  useEffect(() => {
    if (!open) return;
    setType("");
    setTranslations(EMPTY_TRANSLATIONS);
    setTitleErrors({});
  }, [open]);

  const handleSend = async () => {
    const nextErrors: Partial<Record<"en" | "ar", string>> = {};
    if (!translations.en?.title?.trim()) nextErrors.en = t.required;
    if (!translations.ar?.title?.trim()) nextErrors.ar = t.required;
    setTitleErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload: CrmSendNotificationInput = {
      translations: {
        en: {
          title: translations.en?.title?.trim() ?? "",
          body: translations.en?.body?.trim() || undefined,
        },
        ar: {
          title: translations.ar?.title?.trim() ?? "",
          body: translations.ar?.body?.trim() || undefined,
        },
      },
    };
    if (type) payload.type = type;

    const saved = await onSend(payload);
    if (saved) onOpenChange(false);
  };

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t.crmSendNotification}
      description={t.crmSendNotificationHint}
      size="lg"
      isLoading={isSaving}
      footer={
        <>
          <AppButton
            type="button"
            variant="outline"
            disabled={isSaving}
            onClick={() => onOpenChange(false)}
          >
            {t.cancel}
          </AppButton>
          <AppButton
            type="button"
            isLoading={isSaving}
            loadingText={t.loadingMessage}
            onClick={() => void handleSend()}
          >
            {t.crmSendNotification}
          </AppButton>
        </>
      }
    >
      <div className="space-y-4">
        <SelectField
          label={t.notificationType}
          value={type}
          onValueChange={setType}
          options={[{ value: "", label: t.filterAll }, ...typeOptions]}
        />
        <NotificationTranslationFields
          value={translations}
          onChange={setTranslations}
          titleErrors={titleErrors}
          autoFocusFirstField
        />
      </div>
    </AppDialog>
  );
}
