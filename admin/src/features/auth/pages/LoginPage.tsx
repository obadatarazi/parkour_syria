import { LoginForm } from "@/features/auth/components/LoginForm";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { AuthLayout } from "@/shared/layouts/AuthLayout";

export function LoginPage() {
  const t = useTranslation();

  return (
    <AuthLayout title={t.signInTitle} subtitle={t.signInSubtitle}>
      <LoginForm />
    </AuthLayout>
  );
}
