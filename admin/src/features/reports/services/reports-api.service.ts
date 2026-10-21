import type { DashboardSnapshot } from "@/features/dashboard/types/dashboard.types";
import type { ReportsService } from "@/features/reports/services/reports.service.types";
import type { ReportPayload, ReportPeriodParams } from "@/features/reports/types/reports.types";
import { apiRequest, type LaravelSuccessResponse } from "@/shared/lib/api";

function buildReportQuery(params: ReportPeriodParams): Record<string, string> {
  const query: Record<string, string> = { period: params.period };

  if (params.period === "custom" && params.from && params.to) {
    query.from = params.from;
    query.to = params.to;
  }

  return query;
}

export function createApiReportsService(): ReportsService {
  return {
    async getDashboard(params, signal) {
      const response = await apiRequest<LaravelSuccessResponse<DashboardSnapshot>>(
        "/admin/reports/dashboard",
        { signal, params: buildReportQuery(params) },
      );
      return response.data;
    },

    async getReport(params, signal) {
      const response = await apiRequest<LaravelSuccessResponse<ReportPayload>>("/admin/reports", {
        signal,
        params: buildReportQuery(params),
      });
      return response.data;
    },
  };
}
