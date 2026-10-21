import type { ReportPayload, ReportPeriodParams } from "@/features/reports/types/reports.types";
import type { DashboardSnapshot } from "@/features/dashboard/types/dashboard.types";

export interface ReportsService {
  getDashboard(params: ReportPeriodParams, signal?: AbortSignal): Promise<DashboardSnapshot>;
  getReport(params: ReportPeriodParams, signal?: AbortSignal): Promise<ReportPayload>;
}
