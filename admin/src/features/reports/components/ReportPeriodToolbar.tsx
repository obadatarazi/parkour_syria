import { useEffect, useState } from "react";

import { useReportPeriodParams } from "@/features/reports/hooks/use-report-period-params";
import type { ReportPeriod } from "@/features/reports/types/reports.types";
import { AppButton, DatePickerField } from "@/shared/components";
import { cn } from "@/shared/design-system/components/ui/utils";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { toDateInputValue } from "@/shared/lib/datetime.utils";

const PERIODS: ReportPeriod[] = ["week", "month", "year", "custom"];

type ReportPeriodToolbarProps = {
  className?: string;
};

export function ReportPeriodToolbar({ className }: ReportPeriodToolbarProps) {
  const t = useTranslation();
  const { params, setPeriodParams } = useReportPeriodParams();
  const [customFrom, setCustomFrom] = useState(params.from ?? "");
  const [customTo, setCustomTo] = useState(params.to ?? "");
  const [showCustom, setShowCustom] = useState(params.period === "custom");

  useEffect(() => {
    setCustomFrom(params.from ?? "");
    setCustomTo(params.to ?? "");
    setShowCustom(params.period === "custom");
  }, [params.from, params.period, params.to]);

  const periodLabels: Record<ReportPeriod, string> = {
    week: t.periodWeek,
    month: t.periodMonth,
    year: t.periodYear,
    custom: t.periodCustom,
  };

  const selectPreset = (period: ReportPeriod) => {
    if (period === "custom") {
      setShowCustom(true);
      return;
    }

    setShowCustom(false);
    setPeriodParams({ period });
  };

  const applyCustom = () => {
    if (!customFrom || !customTo || customFrom > customTo) {
      return;
    }

    setPeriodParams({ period: "custom", from: customFrom, to: customTo });
  };

  const today = toDateInputValue(new Date());

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        {PERIODS.map((period) => (
          <AppButton
            key={period}
            type="button"
            size="sm"
            variant={
              (period === "custom" && showCustom) || params.period === period
                ? "default"
                : "outline"
            }
            onClick={() => selectPreset(period)}
          >
            {periodLabels[period]}
          </AppButton>
        ))}
      </div>

      {showCustom ? (
        <div className="flex flex-wrap items-end gap-3">
          <DatePickerField
            label={t.periodFrom}
            value={customFrom}
            onChange={setCustomFrom}
            disableFuture
            containerClassName="min-w-[180px]"
          />
          <DatePickerField
            label={t.periodTo}
            value={customTo}
            onChange={setCustomTo}
            min={customFrom || undefined}
            max={today}
            disableFuture
            containerClassName="min-w-[180px]"
          />
          <AppButton type="button" size="sm" onClick={applyCustom}>
            {t.periodApply}
          </AppButton>
        </div>
      ) : null}
    </div>
  );
}
