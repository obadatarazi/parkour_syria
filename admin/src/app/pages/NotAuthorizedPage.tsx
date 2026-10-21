import { ShieldOff } from "lucide-react";
import { Link } from "react-router";

import { ROUTES } from "@/app/router/routes";
import { PageContainer } from "@/shared/components";
import { Button } from "@/shared/design-system/components/ui/button";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

export function NotAuthorizedPage() {
  const t = useTranslation();

  return (
    <PageContainer className="flex min-h-[60vh] items-center justify-center">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <ShieldOff className="size-8" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">{t.notAuthorizedTitle}</h1>
          <p className="text-sm text-muted-foreground">{t.notAuthorizedDescription}</p>
        </div>
        <Button asChild className="rounded-xl">
          <Link to={ROUTES.admin.root}>{t.backToDashboard}</Link>
        </Button>
      </div>
    </PageContainer>
  );
}
