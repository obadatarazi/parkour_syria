import { useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";

import { ROUTES } from "@/app/router/routes";
import { authService } from "@/features/auth/services/auth.service";
import { AppButton, EmailField, FormActions, PasswordField } from "@/shared/components";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { notify } from "@/shared/lib/notifications";
import { isValidEmail } from "@/shared/validation";

export function ResetPasswordForm() {
  const t = useTranslation();
  const navigate = useNavigate();
  const { token: tokenParam } = useParams<{ token?: string }>();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    passwordConfirmation?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const token = tokenParam ?? searchParams.get("token") ?? "";

  const submit = async () => {
    const nextErrors: typeof errors = {};
    if (!email.trim()) nextErrors.email = t.required;
    else if (!isValidEmail(email)) nextErrors.email = t.invalidEmail;
    if (!password.trim()) nextErrors.password = t.required;
    if (password !== passwordConfirmation) nextErrors.passwordConfirmation = t.passwordMismatch;
    if (!token) {
      notify.error(t.errorMessage, t.resetTokenMissing);
      return;
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsLoading(true);
    try {
      await authService.resetPassword({
        email: email.trim(),
        password,
        passwordConfirmation,
        token,
      });
      notify.success(t.successMessage, t.resetPasswordSuccess);
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
        readOnly
        error={errors.email}
        required
      />

      <PasswordField
        label={t.newPassword}
        value={password}
        onChange={(event) => {
          setPassword(event.target.value);
          setErrors((current) => ({ ...current, password: undefined }));
        }}
        error={errors.password}
        required
      />

      <PasswordField
        label={t.confirmPassword}
        value={passwordConfirmation}
        onChange={(event) => {
          setPasswordConfirmation(event.target.value);
          setErrors((current) => ({ ...current, passwordConfirmation: undefined }));
        }}
        error={errors.passwordConfirmation}
        required
      />

      <FormActions>
        <AppButton type="submit" isLoading={isLoading} loadingText={t.loadingMessage}>
          {t.resetPassword}
        </AppButton>
        <Link to={ROUTES.login} className="text-sm font-medium text-brand hover:underline">
          {t.backToLogin}
        </Link>
      </FormActions>
    </form>
  );
}
