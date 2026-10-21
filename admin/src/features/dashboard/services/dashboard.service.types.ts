import type { DashboardSnapshot } from "@/features/dashboard/types/dashboard.types";
import type { ReportPeriodParams } from "@/features/reports/types/reports.types";

export interface DashboardService {
  getSnapshot(params: ReportPeriodParams, signal?: AbortSignal): Promise<DashboardSnapshot>;
}
