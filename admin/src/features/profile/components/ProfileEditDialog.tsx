import { useEffect, useState } from "react";

import type { ProfileUpdateInput } from "@/features/auth/types/auth.types";
import {
  DatePickerField,
  EmailField,
  PhoneField,
  SelectField,
  TextField,
} from "@/shared/components";
import { AppButton } from "@/shared/components/buttons/AppButton";
import { AppDialog } from "@/shared/components/overlay/AppDialog";
import { CrudFileUpload } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { useUserGenderOptions } from "@/shared/hooks/use-options";

type ProfileEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues: ProfileUpdateInput;
  hasExistingAvatar?: boolean;
  isSaving?: boolean;
  onSave: (values: ProfileUpdateInput) => Promise<void>;
};

export function ProfileEditDialog({
  open,
  onOpenChange,
  initialValues,
  hasExistingAvatar = false,
  isSaving = false,
  onSave,
}: ProfileEditDialogProps) {
  const t = useTranslation();
  const { options: genderOptions, isLoading: isGenderOptionsLoading } = useUserGenderOptions();
  const [form, setForm] = useState<ProfileUpdateInput>(initialValues);

  useEffect(() => {
    if (open) {
      setForm(initialValues);
    }
  }, [open, initialValues]);

  const handleSave = async () => {
    await onSave(form);
    onOpenChange(false);
  };

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t.editProfile}
      description={t.profileEditDescription}
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
          label={t.name}
          value={form.fullName ?? ""}
          onChange={(event) =>
            setForm((current) => ({ ...current, fullName: event.target.value }))
          }
        />

        <EmailField
          label={t.email}
          value={form.email ?? ""}
          onChange={(event) =>
            setForm((current) => ({ ...current, email: event.target.value }))
          }
        />

        <PhoneField
          label={t.phone}
          value={form.phoneNumber ?? ""}
          onChange={(event) =>
            setForm((current) => ({ ...current, phoneNumber: event.target.value }))
          }
        />

        <SelectField
          label={t.gender}
          value={form.gender ?? ""}
          onValueChange={(value) =>
            setForm((current) => ({
              ...current,
              gender: value as ProfileUpdateInput["gender"],
            }))
          }
          options={genderOptions}
          placeholder={t.filterAll}
          disabled={isGenderOptionsLoading}
        />

        <DatePickerField
          label={t.dateOfBirth}
          mode="date"
          value={form.dateOfBirth ?? ""}
          onChange={(dateOfBirth) => setForm((current) => ({ ...current, dateOfBirth }))}
          disableFuture
        />

        <CrudFileUpload
          label={t.avatar}
          accept="image/*"
          helperText={hasExistingAvatar ? t.replaceImageHint : undefined}
          value={form.avatar ?? null}
          onFileSelect={(file) => setForm((current) => ({ ...current, avatar: file }))}
        />
      </div>
    </AppDialog>
  );
}
