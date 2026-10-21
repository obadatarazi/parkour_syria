import { useNavigate } from "react-router";

import { ROUTES } from "@/app/router/routes";
import { CrmStatsGrid } from "@/features/customers/components/CrmStatsGrid";
import { useCrmStats } from "@/features/customers/hooks/use-crm-stats";
import type { CrmSegment } from "@/features/customers/types/customers.types";
import { AppButton, LoadingState } from "@/shared/components";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

export function DashboardCrmSection() {
  const t = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading } = useCrmStats();

  const openSegment = (segment: CrmSegment | "") => {
    navigate({
      pathname: ROUTES.admin.customers,
      search: segment ? `?segment=${encodeURIComponent(segment)}` : "",
    });
  };

  return (
    <div className="space-y-3" data-guidance="dashboard-crm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{t.crmDashboardTitle}</h2>
          <p className="text-xs text-muted-foreground">{t.crmDashboardDescription}</p>
        </div>
        <AppButton variant="outline" size="sm" onClick={() => navigate(ROUTES.admin.customers)}>
          {t.crm}
        </AppButton>
      </div>
      {isLoading || !data ? (
        <LoadingState label={t.loadingMessage} />
      ) : (
        <CrmStatsGrid stats={data} onSelectSegment={openSegment} />
      )}
    </div>
  );
}
