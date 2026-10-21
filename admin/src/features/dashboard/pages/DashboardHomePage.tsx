import { useCrudPermissions } from "@/features/auth";
import { CategoryPieChartSection } from "@/features/dashboard/components/CategoryPieChartSection";
import { DashboardCrmSection } from "@/features/dashboard/components/DashboardCrmSection";
import { DashboardRecentOrdersCard } from "@/features/dashboard/components/DashboardRecentOrdersCard";
import { DashboardStatsGrid } from "@/features/dashboard/components/DashboardStatsGrid";
import { LowStockWidget } from "@/features/dashboard/components/LowStockWidget";
import { PendingPrescriptionsWidget } from "@/features/dashboard/components/PendingPrescriptionsWidget";
import { RevenueChartSection } from "@/features/dashboard/components/RevenueChartSection";
import { useDashboard } from "@/features/dashboard/hooks/use-dashboard";
import { ReportPeriodToolbar } from "@/features/reports/components/ReportPeriodToolbar";
import { formatReportRangeLabel } from "@/features/reports/utils/report-period.utils";
import {
  AppButton,
  ErrorState,
  LoadingState,
  PageContainer,
  PageHeader,
  SortableWidget,
  SortableWidgetLayout,
  StatCardSkeleton,
} from "@/shared/components";
import { PERMISSIONS } from "@/shared/constants/permissions";
import {
  useLocalization,
  useTranslation,
} from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { GuidancePageNotices } from "@/shared/guidance/components/GuidancePageNotices";

export function DashboardHomePage() {
  const t = useTranslation();
  const { language } = useLocalization();
  const { data, isLoading, isError, error, refetch } = useDashboard();
  const { canShow: canShowPrescriptions, canUpdate: canUpdatePrescriptions } = useCrudPermissions(
    PERMISSIONS.MANAGE_PRESCRIPTION,
  );
  const { canShow: canShowCrm } = useCrudPermissions(PERMISSIONS.MANAGE_CUSTOMER);
  const showPendingPrescriptions = canShowPrescriptions || canUpdatePrescriptions;

  const rangeLabel = data ? formatReportRangeLabel(data.range, language) : "";

  return (
    <PageContainer>
      <PageHeader
        title={t.dashboard}
        description={data ? rangeLabel : undefined}
        titleDataGuidance="dashboard-title"
        actions={data ? <ReportPeriodToolbar /> : undefined}
      />
      <GuidancePageNotices />

      {isLoading ? (
        <StatCardSkeleton count={5} className="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5" />
      ) : isError || !data ? (
        <ErrorState
          title={t.errorStateDefaultTitle}
          description={resolveServiceErrorMessage(error, t)}
          action={
            <AppButton variant="outline" onClick={() => void refetch()}>
              {t.tryAgain}
            </AppButton>
          }
        />
      ) : (
        <div data-guidance="dashboard-stats">
          <DashboardStatsGrid stats={data.stats} />
        </div>
      )}

      {/* Mount independent widgets immediately so CRM / prescriptions fetch in parallel. */}
      {canShowCrm ? <DashboardCrmSection /> : null}
      {isLoading && showPendingPrescriptions ? <PendingPrescriptionsWidget /> : null}

      {isLoading ? (
        <LoadingState label={t.loadingMessage} />
      ) : data ? (
        <>
          <SortableWidgetLayout
            layoutId="dashboard-charts"
            className="grid gap-5 xl:grid-cols-5"
            data-guidance="dashboard-charts"
          >
            <SortableWidget id="revenue" label={t.revenueOverview} className="xl:col-span-3">
              <RevenueChartSection data={data.revenueChart} />
            </SortableWidget>
            <SortableWidget id="categories" label={t.categoryPerformance} className="xl:col-span-2">
              <CategoryPieChartSection data={data.categoryChart} />
            </SortableWidget>
          </SortableWidgetLayout>

          <SortableWidgetLayout layoutId="dashboard-bottom" className="grid gap-5 xl:grid-cols-5">
            <SortableWidget
              id="recent-orders"
              label={t.recentOrdersTitle}
              className="xl:col-span-3 xl:row-span-2"
            >
              <div data-guidance="dashboard-recent-orders" className="h-full">
                <DashboardRecentOrdersCard orders={data.recentOrders} />
              </div>
            </SortableWidget>
            <SortableWidget id="low-stock" label={t.lowStockAlert} className="xl:col-span-2">
              <div data-guidance="dashboard-attention">
                <LowStockWidget items={data.lowStockItems} />
              </div>
            </SortableWidget>
            {showPendingPrescriptions ? (
              <SortableWidget
                id="pending-prescriptions"
                label={t.pendingReview}
                className="xl:col-span-2"
              >
                <PendingPrescriptionsWidget />
              </SortableWidget>
            ) : null}
          </SortableWidgetLayout>
        </>
      ) : null}
    </PageContainer>
  );
}
