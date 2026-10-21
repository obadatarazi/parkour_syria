import { useCallback } from "react";

import { dashboardService } from "@/features/dashboard/services/dashboard.service";
import type { DashboardSnapshot } from "@/features/dashboard/types/dashboard.types";
import { useReportPeriodParams } from "@/features/reports/hooks/use-report-period-params";
import { useCrudQuery } from "@/shared/crud";

export function useDashboard() {
  const { params } = useReportPeriodParams();

  const queryFn = useCallback(
    (signal?: AbortSignal) => dashboardService.getSnapshot(params, signal),
    [params],
  );

  return useCrudQuery<DashboardSnapshot>({
    queryKey: ["dashboard", "snapshot", params.period, params.from ?? "", params.to ?? ""],
    queryFn,
  });
}
