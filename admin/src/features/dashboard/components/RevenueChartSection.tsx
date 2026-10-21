import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { RevenueChartPoint } from "@/features/dashboard/types/dashboard.types";
import { AppCard } from "@/shared/components";
import {
  useLocalization,
  useTranslation,
} from "@/shared/design-system/localization/contexts/LocalizationContext";
import {
  chartTooltipStyle,
  getChartTheme,
} from "@/shared/design-system/utils/chart-theme";

type RevenueChartSectionProps = {
  data: RevenueChartPoint[];
  variant?: "area" | "line";
};

export function RevenueChartSection({ data, variant = "area" }: RevenueChartSectionProps) {
  const t = useTranslation();
  const { direction } = useLocalization();
  const isRTL = direction === "rtl";
  const chartTheme = useMemo(() => getChartTheme(), []);
  const tooltipStyle = useMemo(() => chartTooltipStyle(chartTheme), [chartTheme]);
  const labelKey = isRTL ? "labelAr" : "label";

  return (
    <AppCard
      title={t.revenueOverview}
      description={t.revenueChartSubtitle}
      className="h-full"
      contentClassName="px-3 pt-0"
    >
      <ResponsiveContainer width="100%" height={210}>
        {variant === "line" ? (
          <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.border} />
            <XAxis
              dataKey={labelKey}
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
              dataKey="revenue"
              name={t.revenue}
              stroke={chartTheme.brand}
              strokeWidth={2.5}
              dot={{ r: 4, fill: chartTheme.brand }}
            />
            <Line
              type="monotone"
              dataKey="orders"
              name={t.ordersChart}
              stroke={chartTheme.accentBrand}
              strokeWidth={2}
              strokeDasharray="4 3"
              dot={false}
            />
          </LineChart>
        ) : (
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartTheme.brand} stopOpacity={0.15} />
                <stop offset="95%" stopColor={chartTheme.brand} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.border} />
            <XAxis
              dataKey={labelKey}
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
            <Area
              type="monotone"
              dataKey="revenue"
              name={t.revenue}
              stroke={chartTheme.brand}
              strokeWidth={2.5}
              fill="url(#revenueGradient)"
              dot={false}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </AppCard>
  );
}
