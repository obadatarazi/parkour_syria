import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useCrmReport } from "@/features/customers/hooks/use-crm-stats";
import { AppCard, LoadingState, StatCard, StatCardGrid } from "@/shared/components";
import {
  useLocalization,
  useTranslation,
} from "@/shared/design-system/localization/contexts/LocalizationContext";
import { chartTooltipStyle, getChartTheme } from "@/shared/design-system/utils/chart-theme";

export function CrmReportsSection() {
  const t = useTranslation();
  const { language } = useLocalization();
  const isRTL = language === "ar";
  const { data, isLoading } = useCrmReport();
  const chartTheme = useMemo(() => getChartTheme(), []);
  const tooltipStyle = useMemo(() => chartTooltipStyle(chartTheme), [chartTheme]);

  if (isLoading || !data) {
    return <LoadingState label={t.loadingMessage} />;
  }

  const kpis = [
    {
      label: t.totalCustomers,
      value: data.stats.totalCustomers.value,
      change: data.stats.totalCustomers.change,
      trend: data.stats.totalCustomers.trend,
    },
    {
      label: t.newCustomers,
      value: data.stats.newCustomers.value,
      change: data.stats.newCustomers.change,
      trend: data.stats.newCustomers.trend,
    },
    {
      label: t.crmCarePlanSubscribers,
      value: data.stats.carePlanSubscribers.value,
      change: data.stats.carePlanSubscribers.change,
      trend: data.stats.carePlanSubscribers.trend,
    },
    {
      label: t.crmRetentionRate,
      value: data.stats.retentionRate.value,
      change: data.stats.retentionRate.change,
      trend: data.stats.retentionRate.trend,
    },
  ];

  return (
    <div className="space-y-5" data-guidance="crm-reports">
      <div>
        <h2 className="text-base font-semibold text-foreground">{t.crmReportsTitle}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t.crmReportsDescription}</p>
      </div>

      <StatCardGrid>
        {kpis.map((kpi) => (
          <StatCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            change={kpi.change}
            trend={kpi.trend}
          />
        ))}
      </StatCardGrid>

      <div className="grid gap-5 xl:grid-cols-3">
        <AppCard
          title={t.crmGrowthTitle}
          description={t.crmGrowthDescription}
          className="xl:col-span-2"
          contentClassName="pt-0"
        >
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.growth} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.border} />
              <XAxis
                dataKey={isRTL ? "monthAr" : "month"}
                tick={{ fontSize: 11, fill: chartTheme.mutedForeground }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: chartTheme.mutedForeground }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="newCustomers"
                name={t.newCustomers}
                stroke={chartTheme.brand}
                strokeWidth={2.5}
                dot={{ r: 4, fill: chartTheme.brand }}
              />
              <Line
                type="monotone"
                dataKey="returning"
                name={t.crmSegmentRepeatBuyers}
                stroke={chartTheme.accentBrand}
                strokeWidth={2}
                strokeDasharray="4 3"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </AppCard>

        <AppCard title={t.crmRetentionTitle} description={t.crmRetentionDescription}>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={data.retention}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={70}
                innerRadius={38}
              >
                {data.retention.map((slice) => (
                  <Cell key={slice.id} fill={slice.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ ...tooltipStyle, fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
          <SliceLegend slices={data.retention} isRTL={isRTL} />
        </AppCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <AppCard
          title={t.crmSegmentsTitle}
          description={t.crmSegmentsDescription}
          contentClassName="pt-0"
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.segments} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.border} vertical={false} />
              <XAxis
                dataKey={isRTL ? "nameAr" : "nameEn"}
                tick={{ fontSize: 11, fill: chartTheme.mutedForeground }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: chartTheme.mutedForeground }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" name={t.customers} radius={[6, 6, 0, 0]}>
                {data.segments.map((slice) => (
                  <Cell key={slice.id} fill={slice.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </AppCard>

        <AppCard title={t.crmCarePlanMixTitle} description={t.crmCarePlanMixDescription}>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={data.carePlanMix}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={70}
                innerRadius={38}
              >
                {data.carePlanMix.map((slice) => (
                  <Cell key={slice.id} fill={slice.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ ...tooltipStyle, fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
          <SliceLegend slices={data.carePlanMix} isRTL={isRTL} />
        </AppCard>
      </div>
    </div>
  );
}

function SliceLegend({
  slices,
  isRTL,
}: {
  slices: { id: string; nameEn: string; nameAr: string; value: number; color: string }[];
  isRTL: boolean;
}) {
  return (
    <div className="mt-2 space-y-1.5">
      {slices.map((slice) => (
        <div key={slice.id} className="flex items-center gap-2 text-xs">
          <span
            className="size-2.5 rounded-full"
            style={{ background: slice.color }}
            aria-hidden="true"
          />
          <span className="flex-1 text-muted-foreground">
            {isRTL ? slice.nameAr : slice.nameEn}
          </span>
          <span className="font-bold text-foreground">{slice.value}</span>
        </div>
      ))}
    </div>
  );
}
