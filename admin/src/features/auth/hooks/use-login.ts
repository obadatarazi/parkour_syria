import { useState } from "react";
import { useLocation, useNavigate } from "react-router";

import { useAuth } from "@/features/auth";
import { AUTH_POST_LOGIN_PATH } from "@/features/auth/constants/auth.constants";
import type { LoginCredentials, LoginFieldErrors } from "@/features/auth/types/auth.types";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { notify } from "@/shared/lib/notifications";
import {
  resolveReturnPath,
  type ReturnLocationState,
} from "@/shared/lib/routing/return-path.utils";
import { isValidEmail } from "@/shared/validation";

const initialCredentials: LoginCredentials = {
  email: "",
  password: "",
  rememberMe: false,
};

export function useLogin() {
  const t = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth();
  const [credentials, setCredentials] = useState<LoginCredentials>(initialCredentials);
  const [errors, setErrors] = useState<LoginFieldErrors>({});

  const updateField = <TField extends keyof LoginCredentials>(
    field: TField,
    value: LoginCredentials[TField],
  ) => {
    setCredentials((current) => ({ ...current, [field]: value }));
    if (errors[field as keyof LoginFieldErrors]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  };

  const validate = () => {
    const nextErrors: LoginFieldErrors = {};
    if (!credentials.email.trim()) nextErrors.email = t.required;
    else if (!isValidEmail(credentials.email)) {
      nextErrors.email = t.invalidEmail;
    }
    if (!credentials.password.trim()) nextErrors.password = t.required;
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;

    try {
      await login(credentials);
      notify.success(t.successMessage, t.signInSuccessDescription);
      const redirectTo = resolveReturnPath(
        (location.state as ReturnLocationState | null) ?? null,
        AUTH_POST_LOGIN_PATH,
      );
      navigate(redirectTo, { replace: true });
    } catch (error) {
      notify.error(t.errorMessage, resolveServiceErrorMessage(error, t));
    }
  };

  return {
    credentials,
    errors,
    isLoading,
    updateField,
    submit,
  };
}
