import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { AuthLayout } from "@/shared/layouts/AuthLayout";

export function ResetPasswordPage() {
  const t = useTranslation();

  return (
    <AuthLayout title={t.resetPasswordTitle} subtitle={t.resetPasswordSubtitle}>
      <ResetPasswordForm />
    </AuthLayout>
  );
}
