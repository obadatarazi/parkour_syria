import { useEffect, useState } from "react";

import type { CrmCustomer, CrmProfileInput } from "@/features/customers/types/customers.types";
import {
  AppButton,
  AppDialog,
  EmailField,
  FormRow,
  PhoneField,
  TextField,
  ToggleField,
} from "@/shared/components";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import type { FieldErrors } from "@/shared/types";

type CustomerCrmProfileDialogProps = {
  open: boolean;
  customer: CrmCustomer;
  isSaving?: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (input: CrmProfileInput) => Promise<boolean>;
};

type ProfileForm = CrmProfileInput;

type ProfileErrors = FieldErrors<
  "fullName" | "email" | "phoneNumber" | "whatsappPhoneNumber"
>;

function toForm(customer: CrmCustomer): ProfileForm {
  return {
    fullName: customer.fullName,
    email: customer.email ?? "",
    phoneNumber: customer.phoneNumber ?? "",
    whatsappPhoneNumber: customer.whatsappPhoneNumber ?? "",
    whatsappNotificationsEnabled: customer.whatsappNotificationsEnabled,
    active: customer.active,
  };
}

export function CustomerCrmProfileDialog({
  open,
  customer,
  isSaving = false,
  onOpenChange,
  onSave,
}: CustomerCrmProfileDialogProps) {
  const t = useTranslation();
  const [form, setForm] = useState<ProfileForm>(() => toForm(customer));
  const [errors, setErrors] = useState<ProfileErrors>({});

  useEffect(() => {
    if (!open) return;
    setForm(toForm(customer));
    setErrors({});
  }, [open, customer]);

  const updateField = <TField extends keyof ProfileForm>(
    field: TField,
    value: ProfileForm[TField],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (field in errors) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  };

  const handleSave = async () => {
    const nextErrors: ProfileErrors = {};
    if (!form.fullName.trim()) nextErrors.fullName = t.required;
    if (!form.phoneNumber.trim()) nextErrors.phoneNumber = t.required;
    if (!form.email.trim()) nextErrors.email = t.required;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      nextErrors.email = t.invalidEmail;

    const whatsappNumber = form.whatsappPhoneNumber.trim();
    const accountPhone = form.phoneNumber.trim();
    if (form.whatsappNotificationsEnabled && !whatsappNumber && !accountPhone) {
      nextErrors.whatsappPhoneNumber = t.whatsappPhoneNumberRequired;
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const saved = await onSave({
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phoneNumber: accountPhone,
      whatsappPhoneNumber: whatsappNumber,
      whatsappNotificationsEnabled: form.whatsappNotificationsEnabled,
      active: form.active,
    });
    if (saved) onOpenChange(false);
  };

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t.crmEditProfile}
      description={t.crmEditProfileHint}
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
            onClick={() => void handleSave()}
          >
            {t.saveChanges}
          </AppButton>
        </>
      }
    >
      <div className="space-y-4">
        <TextField
          label={t.fullName}
          value={form.fullName}
          onChange={(event) => updateField("fullName", event.target.value)}
          error={errors.fullName}
          required
          autoFocus
        />
        <FormRow>
          <EmailField
            label={t.email}
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            error={errors.email}
            required
          />
          <TextField
            label={t.phone}
            value={form.phoneNumber}
            onChange={(event) => updateField("phoneNumber", event.target.value)}
            error={errors.phoneNumber}
            required
          />
        </FormRow>
        <PhoneField
          label={t.whatsappPhoneNumber}
          value={form.whatsappPhoneNumber}
          onChange={(event) => updateField("whatsappPhoneNumber", event.target.value)}
          error={errors.whatsappPhoneNumber}
          helperText={t.whatsappPhoneNumberHint}
        />
        <ToggleField
          label={t.whatsappNotificationsEnabled}
          description={t.whatsappNotificationsHint}
          checked={form.whatsappNotificationsEnabled}
          onCheckedChange={(checked) => updateField("whatsappNotificationsEnabled", checked)}
        />
        <ToggleField
          label={t.active}
          checked={form.active}
          onCheckedChange={(checked) => updateField("active", checked)}
        />
      </div>
    </AppDialog>
  );
}
