import type { ReportPeriod, ReportPeriodParams } from "@/features/reports/types/reports.types";
import { intlLocale } from "@/shared/lib/datetime.utils";

const PERIOD_PARAM = "period";
const FROM_PARAM = "from";
const TO_PARAM = "to";

export const DEFAULT_REPORT_PERIOD: ReportPeriod = "month";

export function parseReportPeriodParams(searchParams: URLSearchParams): ReportPeriodParams {
  const periodParam = searchParams.get(PERIOD_PARAM);
  const period: ReportPeriod =
    periodParam === "week" ||
    periodParam === "month" ||
    periodParam === "year" ||
    periodParam === "custom"
      ? periodParam
      : DEFAULT_REPORT_PERIOD;

  const from = searchParams.get(FROM_PARAM) ?? undefined;
  const to = searchParams.get(TO_PARAM) ?? undefined;

  if (period === "custom" && from && to) {
    return { period, from, to };
  }

  return { period: period === "custom" ? DEFAULT_REPORT_PERIOD : period };
}

export function buildReportPeriodSearchParams(params: ReportPeriodParams): URLSearchParams {
  const next = new URLSearchParams();
  next.set(PERIOD_PARAM, params.period);

  if (params.period === "custom" && params.from && params.to) {
    next.set(FROM_PARAM, params.from);
    next.set(TO_PARAM, params.to);
  }

  return next;
}

export function formatReportRangeLabel(
  range: { from: string; to: string },
  locale: string,
): string {
  const formatter = new Intl.DateTimeFormat(intlLocale(locale, "en-GB"), {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return `${formatter.format(new Date(range.from))} – ${formatter.format(new Date(range.to))}`;
}
