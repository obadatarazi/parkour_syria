import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { ReportNamedSlice } from "@/features/reports/types/reports.types";
import { AppCard } from "@/shared/components";
import {
  useLocalization,
} from "@/shared/design-system/localization/contexts/LocalizationContext";
import {
  chartTooltipStyle,
  getChartTheme,
} from "@/shared/design-system/utils/chart-theme";

type ReportSlicePieCardProps = {
  title: string;
  description?: string;
  data: ReportNamedSlice[];
  valueSuffix?: string;
};

export function ReportSlicePieCard({
  title,
  description,
  data,
  valueSuffix = "",
}: ReportSlicePieCardProps) {
  const { direction } = useLocalization();
  const isRTL = direction === "rtl";
  const chartTheme = useMemo(() => getChartTheme(), []);
  const tooltipStyle = useMemo(
    () => ({ ...chartTooltipStyle(chartTheme), fontSize: 11 }),
    [chartTheme],
  );

  return (
    <AppCard title={title} description={description} className="h-full">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey={isRTL ? "nameAr" : "nameEn"}
            cx="50%"
            cy="50%"
            outerRadius={70}
            innerRadius={38}
          >
            {data.map((entry) => (
              <Cell key={entry.id} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-2 space-y-1.5">
        {data.map((slice) => (
          <div key={slice.id} className="flex items-center gap-2 text-xs">
            <span
              className="size-2.5 rounded-full"
              style={{ background: slice.color }}
              aria-hidden="true"
            />
            <span className="flex-1 text-muted-foreground">
              {isRTL ? slice.nameAr : slice.nameEn}
            </span>
            <span className="font-bold text-foreground">
              {slice.value}
              {valueSuffix}
            </span>
          </div>
        ))}
      </div>
    </AppCard>
  );
}
