import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { AuthLayout } from "@/shared/layouts/AuthLayout";

export function ForgotPasswordPage() {
  const t = useTranslation();

  return (
    <AuthLayout title={t.forgotPasswordTitle} subtitle={t.forgotPasswordSubtitle}>
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
