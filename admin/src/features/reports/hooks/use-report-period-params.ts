import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";

import type { ReportPeriodParams } from "@/features/reports/types/reports.types";
import {
  buildReportPeriodSearchParams,
  parseReportPeriodParams,
} from "@/features/reports/utils/report-period.utils";

export function useReportPeriodParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const params = useMemo(
    () => parseReportPeriodParams(searchParams),
    [searchParams],
  );

  const setPeriodParams = useCallback(
    (next: ReportPeriodParams) => {
      setSearchParams(buildReportPeriodSearchParams(next), { replace: true });
    },
    [setSearchParams],
  );

  return { params, setPeriodParams };
}
