import { Link } from "react-router";

import { ROUTES } from "@/app/router/routes";
import { AppButton, EmptyState, PageContainer } from "@/shared/components";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

export function NotFoundPage() {
  const t = useTranslation();

  return (
    <PageContainer className="flex min-h-screen items-center justify-center">
      <EmptyState
        title={t.pageNotFoundTitle}
        description={t.pageNotFoundDescription}
        action={
          <AppButton asChild>
            <Link to={ROUTES.admin.root}>{t.goToDashboard}</Link>
          </AppButton>
        }
        className="max-w-md"
      />
    </PageContainer>
  );
}
