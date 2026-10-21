import { type ReactNode, useEffect, useState } from "react";

import { NotificationRecipientsPicker } from "@/features/notifications/components/NotificationRecipientsPicker";
import { NotificationTranslationFields } from "@/features/notifications/components/NotificationTranslationFields";
import type {
  Notification,
  NotificationFormData,
} from "@/features/notifications/types/notifications.types";
import {
  createEmptyNotificationForm,
  notificationToFormData,
} from "@/features/notifications/types/notifications.types";
import { SelectField } from "@/shared/components";
import { CrudFormFooter, CrudFormShell } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { useNotificationTypeOptions } from "@/shared/hooks/use-options";

type NotificationFormProps = {
  mode: "create" | "edit";
  entity?: Notification | null;
  isLoading?: boolean;
  onSubmit: (data: NotificationFormData) => void | Promise<void>;
  onCancel: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
};

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-xl border border-border bg-muted/15 p-4">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function NotificationForm({
  mode,
  entity,
  isLoading = false,
  onSubmit,
  onCancel,
  onDirtyChange,
}: NotificationFormProps) {
  const t = useTranslation();
  const { options: typeOptions } = useNotificationTypeOptions();
  const [form, setForm] = useState<NotificationFormData>(createEmptyNotificationForm());
  const [titleErrors, setTitleErrors] = useState<Partial<Record<"en" | "ar", string>>>({});
  const [typeError, setTypeError] = useState<string | undefined>();
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setForm(entity ? notificationToFormData(entity) : createEmptyNotificationForm());
    setTitleErrors({});
    setTypeError(undefined);
    setIsDirty(false);
  }, [entity, mode]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const updateForm = (
    updater: (current: NotificationFormData) => NotificationFormData,
  ) => {
    setForm(updater);
    setIsDirty(true);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextTitleErrors: Partial<Record<"en" | "ar", string>> = {};
    if (!form.translations.en?.title?.trim()) {
      nextTitleErrors.en = t.required;
    }
    if (!form.translations.ar?.title?.trim()) {
      nextTitleErrors.ar = t.required;
    }
    const nextTypeError = !form.type ? t.required : undefined;
    setTitleErrors(nextTitleErrors);
    setTypeError(nextTypeError);
    if (Object.keys(nextTitleErrors).length > 0 || nextTypeError) return;
    void onSubmit(form);
  };

  return (
    <CrudFormShell onSubmit={handleSubmit} className="space-y-4">
      <FormSection title={t.notificationContent}>
        <NotificationTranslationFields
          value={form.translations}
          onChange={(translations) => updateForm((current) => ({ ...current, translations }))}
          titleErrors={titleErrors}
          autoFocusFirstField
        />
      </FormSection>

      <FormSection title={t.notificationDetails}>
        <SelectField
          label={t.notificationType}
          value={form.type}
          onValueChange={(value) =>
            updateForm((current) => ({
              ...current,
              type: value as NotificationFormData["type"],
            }))
          }
          options={typeOptions}
          placeholder={t.selectNotificationType}
          error={typeError}
          required
        />
      </FormSection>

      <FormSection
        title={t.notificationRecipients}
        description={t.notificationRecipientsHint}
      >
        <NotificationRecipientsPicker
          value={form.userIds}
          onChange={(userIds) => updateForm((current) => ({ ...current, userIds }))}
          disabled={isLoading}
        />
      </FormSection>

      <CrudFormFooter
        submitLabel={mode === "create" ? t.addNotification : t.save}
        cancelLabel={t.cancel}
        onCancel={onCancel}
        isLoading={isLoading}
        loadingLabel={t.loadingMessage}
      />
    </CrudFormShell>
  );
}
