import { useCallback } from "react";

import { useReportPeriodParams } from "@/features/reports/hooks/use-report-period-params";
import { reportsService } from "@/features/reports/services/reports.service";
import type { ReportPayload } from "@/features/reports/types/reports.types";
import { useCrudQuery } from "@/shared/crud";

export function useReports() {
  const { params } = useReportPeriodParams();

  const queryFn = useCallback(
    (signal?: AbortSignal) => reportsService.getReport(params, signal),
    [params],
  );

  return useCrudQuery<ReportPayload>({
    queryKey: ["reports", params.period, params.from ?? "", params.to ?? ""],
    queryFn,
  });
}
