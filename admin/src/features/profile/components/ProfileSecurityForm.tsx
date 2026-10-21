import { useState } from "react";

import type { ChangePasswordInput } from "@/features/auth/types/auth.types";
import { PasswordField } from "@/shared/components";
import { AppButton } from "@/shared/components/buttons/AppButton";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { notify } from "@/shared/lib/notifications";

type ProfileSecurityFormProps = {
  onChangePassword: (input: ChangePasswordInput) => Promise<void>;
};

export function ProfileSecurityForm({ onChangePassword }: ProfileSecurityFormProps) {
  const t = useTranslation();
  const [passwords, setPasswords] = useState<ChangePasswordInput>({
    currentPassword: "",
    newPassword: "",
    newPasswordConfirmation: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    if (passwords.newPassword !== passwords.newPasswordConfirmation) {
      notify.error(t.errorMessage, t.passwordMismatch);
      return;
    }

    setIsSaving(true);
    try {
      await onChangePassword(passwords);
      setPasswords({
        currentPassword: "",
        newPassword: "",
        newPasswordConfirmation: "",
      });
      notify.success(t.successMessage, t.passwordChangedDescription);
    } catch (error) {
      notify.error(t.errorMessage, resolveServiceErrorMessage(error, t));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-start text-sm text-muted-foreground">{t.profileSecurityDescription}</p>

      <PasswordField
        label={t.currentPassword}
        value={passwords.currentPassword}
        onChange={(event) =>
          setPasswords((current) => ({
            ...current,
            currentPassword: event.target.value,
          }))
        }
      />

      <PasswordField
        label={t.newPassword}
        value={passwords.newPassword}
        onChange={(event) =>
          setPasswords((current) => ({ ...current, newPassword: event.target.value }))
        }
      />

      <PasswordField
        label={t.confirmPassword}
        value={passwords.newPasswordConfirmation}
        onChange={(event) =>
          setPasswords((current) => ({
            ...current,
            newPasswordConfirmation: event.target.value,
          }))
        }
      />

      <div className="flex justify-end pt-2">
        <AppButton
          type="button"
          variant="outline"
          isLoading={isSaving}
          loadingText={t.loadingMessage}
          onClick={() => void handleSubmit()}
        >
          {t.changePassword}
        </AppButton>
      </div>
    </div>
  );
}
