import { useState } from "react";
import { Link, useNavigate } from "react-router";

import { ROUTES } from "@/app/router/routes";
import { authService } from "@/features/auth/services/auth.service";
import { AppButton, EmailField, FormActions } from "@/shared/components";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { notify } from "@/shared/lib/notifications";
import { isValidEmail } from "@/shared/validation";

export function ForgotPasswordForm() {
  const t = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const submit = async () => {
    if (!email.trim()) {
      setError(t.required);
      return;
    }
    if (!isValidEmail(email)) {
      setError(t.invalidEmail);
      return;
    }

    setIsLoading(true);
    try {
      await authService.forgotPassword({ email: email.trim() });
      notify.success(t.successMessage, t.resetSent);
      navigate(ROUTES.login, { replace: true });
    } catch (error) {
      notify.error(t.errorMessage, resolveServiceErrorMessage(error, t));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
      className="space-y-5"
      noValidate
    >
      <EmailField
        label={t.emailAddress}
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
          setError(undefined);
        }}
        error={error}
        required
      />

      <FormActions className="sm:flex-col">
        <AppButton
          type="submit"
          className="w-full"
          isLoading={isLoading}
          loadingText={t.loadingMessage}
        >
          {t.sendResetLink}
        </AppButton>
        <Link
          to={ROUTES.login}
          className="text-center text-sm font-medium text-brand hover:underline"
        >
          {t.backToLogin}
        </Link>
      </FormActions>
    </form>
  );
}
