import type { DashboardService } from "@/features/dashboard/services/dashboard.service.types";
import { reportsService } from "@/features/reports/services/reports.service";

export const dashboardService: DashboardService = {
  getSnapshot(params, signal) {
    return reportsService.getDashboard(params, signal);
  },
};
