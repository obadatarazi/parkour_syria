import { useCrudPermissions } from "@/features/auth";
import { CrmReportsSection } from "@/features/customers/components/CrmReportsSection";
import { CategoryPieChartSection } from "@/features/dashboard/components/CategoryPieChartSection";
import { RevenueChartSection } from "@/features/dashboard/components/RevenueChartSection";
import { formatKwd } from "@/features/products/utils/product-display.utils";
import { ReportOrdersSeriesCard } from "@/features/reports/components/ReportOrdersSeriesCard";
import { ReportPeriodToolbar } from "@/features/reports/components/ReportPeriodToolbar";
import { ReportSlicePieCard } from "@/features/reports/components/ReportSlicePieCard";
import { useReports } from "@/features/reports/hooks/use-reports";
import { formatReportRangeLabel } from "@/features/reports/utils/report-period.utils";
import {
  AppButton,
  AppCard,
  ErrorState,
  LoadingState,
  MediaImage,
  PageContainer,
  PageHeader,
  SortableWidget,
  SortableWidgetLayout,
  StatCard,
  StatCardGrid,
  UserAvatar,
} from "@/shared/components";
import { PERMISSIONS } from "@/shared/constants/permissions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/design-system/components/ui/table";
import { cn } from "@/shared/design-system/components/ui/utils";
import {
  useLocalization,
  useTranslation,
} from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";

export function ReportsPage() {
  const t = useTranslation();
  const { language } = useLocalization();
  const isRTL = language === "ar";
  const { canShow: canShowCrm } = useCrudPermissions(PERMISSIONS.MANAGE_CUSTOMER);
  const { data, isLoading, isError, error, refetch } = useReports();

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader title={t.reports} titleDataGuidance="reports-title" />
        <LoadingState label={t.loadingMessage} />
      </PageContainer>
    );
  }

  if (isError || !data) {
    return (
      <PageContainer>
        <PageHeader title={t.reports} titleDataGuidance="reports-title" />
        <ErrorState
          title={t.errorStateDefaultTitle}
          description={resolveServiceErrorMessage(error, t)}
          action={
            <AppButton variant="outline" onClick={() => void refetch()}>
              {t.tryAgain}
            </AppButton>
          }
        />
      </PageContainer>
    );
  }

  const rangeLabel = formatReportRangeLabel(data.range, language);

  const kpis = [
    {
      id: "order-completion",
      label: t.orderCompletionRate,
      stat: data.stats.orderCompletionRate,
    },
    { id: "avg-order", label: t.avgOrderValue, stat: data.stats.avgOrderValue, money: true },
    { id: "new-customers", label: t.newCustomers, stat: data.stats.newCustomers },
    { id: "return-rate", label: t.returnRate, stat: data.stats.returnRate },
    { id: "delivery-fees", label: t.deliveryFees, stat: data.stats.deliveryFees, money: true },
    { id: "savings", label: t.savingsTotal, stat: data.stats.savingsTotal, money: true },
    { id: "units-sold", label: t.unitsSold, stat: data.stats.unitsSold },
    { id: "carts-with-orders", label: t.cartsWithOrders, stat: data.stats.cartsWithOrders },
    {
      id: "carts-with-no-orders",
      label: t.cartsWithNoOrders,
      stat: data.stats.cartsWithNoOrders,
      higherIsBetter: false,
    },
    { id: "cart-conversion", label: t.cartConversionRate, stat: data.stats.cartConversionRate },
  ];

  const savingsSlices = [
    {
      id: "coupons",
      nameEn: t.couponSavings,
      nameAr: t.couponSavings,
      value: data.savings.coupons.amount ?? data.savings.coupons.count,
      color: "#6366f1",
    },
    {
      id: "promotions",
      nameEn: t.promotionSavings,
      nameAr: t.promotionSavings,
      value: data.savings.promotions.amount ?? data.savings.promotions.count,
      color: "#22c55e",
    },
    {
      id: "loyalty",
      nameEn: t.loyaltySavings,
      nameAr: t.loyaltySavings,
      value: data.savings.loyalty.amount ?? data.savings.loyalty.count,
      color: "#f59e0b",
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title={t.reports}
        description={rangeLabel}
        titleDataGuidance="reports-title"
        actions={<ReportPeriodToolbar />}
      />

      {canShowCrm ? <CrmReportsSection /> : null}

      <SortableWidgetLayout layoutId="reports-kpis" columns={4}>
        {kpis.map(({ id, label, stat, money, higherIsBetter }) => (
          <SortableWidget key={id} id={id} label={label}>
            <StatCard
              label={label}
              value={
                money
                  ? formatKwd(stat.amount ?? (Number.parseFloat(stat.value.replace(/,/g, "")) || 0))
                  : stat.value
              }
              change={stat.change}
              trend={stat.trend}
              higherIsBetter={higherIsBetter}
            />
          </SortableWidget>
        ))}
      </SortableWidgetLayout>

      <AppCard title={t.savingsTotal} description={t.savingsBreakdownDescription}>
        <StatCardGrid className="mb-4">
          <StatCard
            label={t.couponSavings}
            value={formatKwd(data.savings.coupons.amount ?? 0)}
            change={data.savings.coupons.change}
            trend={data.savings.coupons.trend}
          />
          <StatCard
            label={t.freeShippingSaved}
            value={formatKwd(data.savings.couponsShipping.amount ?? 0)}
            change={data.savings.couponsShipping.change}
            trend={data.savings.couponsShipping.trend}
          />
          <StatCard
            label={t.promotionSavings}
            value={formatKwd(data.savings.promotions.amount ?? 0)}
            change={data.savings.promotions.change}
            trend={data.savings.promotions.trend}
          />
          <StatCard
            label={t.loyaltySavings}
            value={formatKwd(data.savings.loyalty.amount ?? 0)}
            change={data.savings.loyalty.change}
            trend={data.savings.loyalty.trend}
          />
        </StatCardGrid>
        <ReportSlicePieCard title={t.savingsTotal} data={savingsSlices} />
      </AppCard>

      <div className="space-y-3" data-guidance="coupon-report">
        <div>
          <h2 className="text-base font-semibold text-foreground">{t.couponReportTitle}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t.couponReportDescription}</p>
        </div>
        <StatCardGrid>
          <StatCard
            label={t.couponAttachRate}
            value={`${data.couponReport.attachRate}%`}
            change=""
            trend="neutral"
          />
          <StatCard
            label={t.couponUsageCount}
            value={String(data.couponReport.usageCount)}
            change=""
            trend="neutral"
          />
          <StatCard
            label={t.ordersWithCoupon}
            value={String(data.couponReport.ordersWithCoupon)}
            change=""
            trend="neutral"
          />
          <StatCard
            label={t.ordersWithoutCoupon}
            value={String(data.couponReport.ordersWithoutCoupon)}
            change=""
            trend="neutral"
          />
        </StatCardGrid>
        <div className="grid gap-5 xl:grid-cols-2">
          <ReportSlicePieCard
            title={t.couponTypeMix}
            data={data.couponReport.typeMix}
            valueSuffix=""
          />
          <AppCard padding="none" title={t.topCoupons} className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  {[t.code, t.type, t.uses, t.saved].map((header) => (
                    <TableHead
                      key={header}
                      className="px-4 py-3 text-xs font-bold tracking-wider text-muted-foreground uppercase"
                    >
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.couponReport.topCoupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell className="px-4 py-3 text-xs font-semibold">{coupon.code}</TableCell>
                    <TableCell className="px-4 py-3 text-xs text-muted-foreground">
                      {coupon.type}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-xs">{coupon.uses}</TableCell>
                    <TableCell className="px-4 py-3 text-xs font-bold text-brand">
                      {formatKwd(coupon.saved)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AppCard>
        </div>
        {data.couponReport.unusedActive.length > 0 ? (
          <AppCard padding="none" title={t.unusedCoupons} className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  {[t.code, t.name, t.status].map((header) => (
                    <TableHead
                      key={header}
                      className="px-4 py-3 text-xs font-bold tracking-wider text-muted-foreground uppercase"
                    >
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.couponReport.unusedActive.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell className="px-4 py-3 text-xs font-semibold">{coupon.code}</TableCell>
                    <TableCell className="px-4 py-3 text-xs">{coupon.title}</TableCell>
                    <TableCell className="px-4 py-3 text-xs text-muted-foreground">
                      {coupon.status}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AppCard>
        ) : null}
      </div>

      <SortableWidgetLayout layoutId="reports-charts" className="grid gap-5 xl:grid-cols-3">
        <SortableWidget id="revenue" label={t.revenueOverview} className="xl:col-span-2">
          <RevenueChartSection data={data.revenueChart} variant="line" />
        </SortableWidget>
        <SortableWidget id="category" label={t.categoryPerformance}>
          <CategoryPieChartSection data={data.categoryChart} />
        </SortableWidget>
      </SortableWidgetLayout>

      <SortableWidgetLayout layoutId="reports-secondary-charts" className="grid gap-5 xl:grid-cols-3">
        <SortableWidget id="brand" label={t.brandPerformance}>
          <ReportSlicePieCard
            title={t.brandPerformance}
            data={data.brandChart}
            valueSuffix="%"
          />
        </SortableWidget>
        <SortableWidget id="order-status" label={t.orderStatusMix}>
          <ReportSlicePieCard title={t.orderStatusMix} data={data.orderStatusMix} />
        </SortableWidget>
        <SortableWidget id="payment" label={t.paymentMix}>
          <ReportSlicePieCard title={t.paymentMix} data={data.paymentMix} />
        </SortableWidget>
      </SortableWidgetLayout>

      <SortableWidgetLayout layoutId="reports-tables" className="grid gap-5 xl:grid-cols-2">
        <SortableWidget id="top-products" label={t.topProducts}>
          <AppCard padding="none" title={t.topProducts} className="h-full overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  {["#", t.product, t.sold, t.revenue, t.currentStock].map((header) => (
                    <TableHead
                      key={header}
                      className="px-4 py-3 text-xs font-bold tracking-wider text-muted-foreground uppercase"
                    >
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topProducts.map((product, index) => (
                  <TableRow key={product.id}>
                    <TableCell className="px-4 py-3">
                      <span
                        className={cn(
                          "flex size-6 items-center justify-center rounded-full text-xs font-bold",
                          index === 0 && "bg-warning-muted text-warning",
                          index === 1 && "bg-muted text-muted-foreground",
                          index > 1 && "bg-brand-muted text-brand",
                        )}
                      >
                        {index + 1}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {product.imageUrl ? (
                          <div className="size-8 flex-none overflow-hidden rounded-lg bg-muted">
                            <MediaImage
                              src={product.imageUrl}
                              alt=""
                              className="size-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        ) : null}
                        <p className="max-w-[140px] truncate text-xs font-semibold text-foreground">
                          {isRTL ? product.nameAr : product.nameEn}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                      {product.sold.toLocaleString("en-US")}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-xs font-bold text-brand">
                      {formatKwd(product.revenue)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-xs font-semibold">
                      {product.stock}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AppCard>
        </SortableWidget>

        <SortableWidget id="top-customers" label={t.topCustomers}>
          <AppCard padding="none" title={t.topCustomers} className="h-full overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  {["#", t.customer, t.orders, t.spent].map((header) => (
                    <TableHead
                      key={header}
                      className="px-4 py-3 text-xs font-bold tracking-wider text-muted-foreground uppercase"
                    >
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topCustomers.map((customer, index) => (
                  <TableRow key={customer.id}>
                    <TableCell className="px-4 py-3">
                      <span
                        className={cn(
                          "flex size-6 items-center justify-center rounded-full text-xs font-bold",
                          index === 0
                            ? "bg-warning-muted text-warning"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {index + 1}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <UserAvatar name={customer.avatar} />
                        <p className="text-xs font-semibold text-foreground">
                          {isRTL ? customer.nameAr : customer.nameEn}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                      {customer.orders}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-xs font-bold text-brand">
                      {formatKwd(customer.spent)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AppCard>
        </SortableWidget>
      </SortableWidgetLayout>

      <AppCard padding="none" title={t.deliveryByZone} className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              {[t.zone, t.orders, t.deliveryFees].map((header) => (
                <TableHead
                  key={header}
                  className="px-4 py-3 text-xs font-bold tracking-wider text-muted-foreground uppercase"
                >
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.deliveryByZone.map((zone) => (
              <TableRow key={zone.id}>
                <TableCell className="px-4 py-3 text-xs font-semibold">
                  {isRTL ? zone.nameAr : zone.nameEn}
                </TableCell>
                <TableCell className="px-4 py-3 text-xs">{zone.orders}</TableCell>
                <TableCell className="px-4 py-3 text-xs font-bold text-brand">
                  {formatKwd(zone.fees)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AppCard>

      <ReportOrdersSeriesCard data={data.ordersSeries} />
    </PageContainer>
  );
}
