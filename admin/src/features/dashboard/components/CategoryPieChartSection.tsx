import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { CategoryChartPoint } from "@/features/dashboard/types/dashboard.types";
import { AppCard } from "@/shared/components";
import {
  useLocalization,
  useTranslation,
} from "@/shared/design-system/localization/contexts/LocalizationContext";
import {
  chartTooltipStyle,
  getChartTheme,
} from "@/shared/design-system/utils/chart-theme";

type CategoryPieChartSectionProps = {
  data: CategoryChartPoint[];
};

export function CategoryPieChartSection({ data }: CategoryPieChartSectionProps) {
  const t = useTranslation();
  const { direction } = useLocalization();
  const isRTL = direction === "rtl";
  const chartTheme = useMemo(() => getChartTheme(), []);
  const tooltipStyle = useMemo(
    () => ({ ...chartTooltipStyle(chartTheme), fontSize: 11 }),
    [chartTheme],
  );

  return (
    <AppCard
      title={t.categoryPerformance}
      description={t.categoryChartSubtitle}
      className="h-full"
    >
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey={isRTL ? "nameAr" : "nameEn"}
            cx="50%"
            cy="50%"
            outerRadius={65}
            innerRadius={35}
          >
            {data.map((entry) => (
              <Cell key={entry.nameEn} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-2 grid grid-cols-2 gap-1.5">
        {data.map((category) => (
          <div key={category.nameEn} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="size-2.5 flex-none rounded-full"
              style={{ backgroundColor: category.color }}
              aria-hidden="true"
            />
            <span className="truncate">{isRTL ? category.nameAr : category.nameEn}</span>
            <span className="ms-auto font-bold text-foreground">{category.value}%</span>
          </div>
        ))}
      </div>
    </AppCard>
  );
}
