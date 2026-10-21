import { Shield } from "lucide-react";

import { useLogin } from "@/features/auth/hooks/use-login";
import {
  AppButton,
  CheckboxField,
  EmailField,
  PasswordField,
} from "@/shared/components";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

export function LoginForm() {
  const t = useTranslation();
  const { credentials, errors, isLoading, updateField, submit } = useLogin();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
      className="space-y-4"
      noValidate
    >
      <EmailField
        label={t.emailAddress}
        value={credentials.email}
        onChange={(event) => updateField("email", event.target.value)}
        error={errors.email}
        required
      />

      {/* No forgot-password link: the Parkour backend has no reset endpoints yet, a SuperAdmin
          resets a password from the users screen. */}
      <PasswordField
        label={t.password}
        value={credentials.password}
        onChange={(event) => updateField("password", event.target.value)}
        error={errors.password}
        required
      />

      <CheckboxField
        label={t.rememberMe}
        checked={credentials.rememberMe}
        onCheckedChange={(checked) => updateField("rememberMe", checked)}
      />

      <p className="flex items-center justify-center gap-1.5 pt-1 text-xs text-muted-foreground">
        <Shield className="size-3.5 shrink-0" aria-hidden="true" />
        {t.authEncryptedSafe}
      </p>

      <AppButton
        type="submit"
        className="w-full"
        isLoading={isLoading}
        loadingText={t.loadingMessage}
      >
        {t.signIn}
      </AppButton>
    </form>
  );
}
