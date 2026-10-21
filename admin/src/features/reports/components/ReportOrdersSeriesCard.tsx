import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ReportOrdersSeriesPoint } from "@/features/reports/types/reports.types";
import { AppCard } from "@/shared/components";
import {
  useLocalization,
  useTranslation,
} from "@/shared/design-system/localization/contexts/LocalizationContext";
import {
  chartTooltipStyle,
  getChartTheme,
} from "@/shared/design-system/utils/chart-theme";

type ReportOrdersSeriesCardProps = {
  data: ReportOrdersSeriesPoint[];
};

export function ReportOrdersSeriesCard({ data }: ReportOrdersSeriesCardProps) {
  const t = useTranslation();
  const { direction } = useLocalization();
  const isRTL = direction === "rtl";
  const chartTheme = useMemo(() => getChartTheme(), []);
  const tooltipStyle = useMemo(() => chartTooltipStyle(chartTheme), [chartTheme]);
  const labelKey = isRTL ? "labelAr" : "label";

  return (
    <AppCard title={t.ordersThisWeek} description={t.ordersWeekSubtitle}>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.border} vertical={false} />
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
          <Bar
            dataKey="orders"
            name={t.ordersChart}
            fill={chartTheme.brand}
            radius={[6, 6, 0, 0]}
          />
          <Bar
            dataKey="returns"
            name={t.returnsChart}
            fill={chartTheme.warning}
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </AppCard>
  );
}
