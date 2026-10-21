import { useEffect, useState } from "react";

import type {
  ContactUsFormData,
  ContactUsMessage,
} from "@/features/contact-us/types/contact-us.types";
import {
  contactUsToFormData,
  createEmptyContactUsForm,
} from "@/features/contact-us/types/contact-us.types";
import { AppButton, PhoneField, SelectField, TextAreaField, TextField } from "@/shared/components";
import { CrudFormFooter, CrudFormShell } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { useContactUsStatusOptions } from "@/shared/hooks/use-options";

type ContactUsFormProps = {
  message?: ContactUsMessage | null;
  canUpdate?: boolean;
  isLoading?: boolean;
  onSubmit: (data: ContactUsFormData) => void | Promise<void>;
  onCancel: () => void;
  /** Reports whether the form has unsaved changes since it was last reset. */
  onDirtyChange?: (isDirty: boolean) => void;
};

export function ContactUsForm({
  message,
  canUpdate = false,
  isLoading = false,
  onSubmit,
  onCancel,
  onDirtyChange,
}: ContactUsFormProps) {
  const t = useTranslation();
  const { options: statusOptions, isLoading: isStatusOptionsLoading } = useContactUsStatusOptions();
  const [form, setForm] = useState<ContactUsFormData>(createEmptyContactUsForm());
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setForm(message ? contactUsToFormData(message) : createEmptyContactUsForm());
    setIsDirty(false);
  }, [message]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void onSubmit(form);
  };

  return (
    <CrudFormShell onSubmit={handleSubmit}>
      <TextField label={t.fullName} value={message?.userFullName ?? ""} readOnly />
      <TextField label={t.email} value={message?.userEmail ?? ""} readOnly type="email" />
      <PhoneField
        label={t.phoneNumber}
        value={message?.userPhoneNumber ?? ""}
        readOnly
      />
      <TextAreaField label={t.message} value={message?.message ?? ""} readOnly rows={5} />
      <SelectField
        label={t.status}
        value={form.status}
        options={statusOptions}
        onValueChange={(value) => {
          setForm((current) => ({ ...current, status: value as ContactUsFormData["status"] }));
          setIsDirty(true);
        }}
        disabled={!canUpdate || isStatusOptionsLoading}
      />

      {canUpdate ? (
        <CrudFormFooter
          submitLabel={t.save}
          cancelLabel={t.cancel}
          onCancel={onCancel}
          isLoading={isLoading}
          loadingLabel={t.loadingMessage}
        />
      ) : (
        <div className="sticky bottom-0 -mx-6 -mb-5 mt-6 flex justify-end border-t border-border/50 bg-card/95 px-6 py-4 backdrop-blur-sm supports-[backdrop-filter]:bg-card/80">
          <AppButton type="button" variant="outline" onClick={onCancel}>
            {t.cancel}
          </AppButton>
        </div>
      )}
    </CrudFormShell>
  );
}
