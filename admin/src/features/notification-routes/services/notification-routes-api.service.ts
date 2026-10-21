import type { NotificationRoutesService } from "@/features/notification-routes/services/notification-routes.service.types";
import type {
  NotificationRouteApiRecord,
  NotificationRouteTestResult,
} from "@/features/notification-routes/services/notification-routes.service.types";
import type { NotificationRouteFormData } from "@/features/notification-routes/types/notification-routes.types";
import { mapNotificationRouteFromApi } from "@/features/notification-routes/utils/map-notification-route-from-api";
import { apiRequest, type LaravelSuccessResponse } from "@/shared/lib/api";

function buildPayload(data: NotificationRouteFormData): {
  recipients: NotificationRouteFormData["recipients"];
} {
  return {
    recipients: data.recipients.map((recipient) => ({
      userId: recipient.userId,
      inApp: recipient.inApp,
      email: recipient.email,
    })),
  };
}

function createApiNotificationRoutesService(): NotificationRoutesService {
  return {
    async list(signal?: AbortSignal) {
      const response = await apiRequest<LaravelSuccessResponse<NotificationRouteApiRecord[]>>(
        "/admin/notification-routes",
        { signal },
      );

      return (response.data ?? []).map((item) => mapNotificationRouteFromApi(item));
    },

    async update(event, data) {
      const response = await apiRequest<LaravelSuccessResponse<NotificationRouteApiRecord>>(
        `/admin/notification-routes/${encodeURIComponent(event)}`,
        {
          method: "PUT",
          body: buildPayload(data),
        },
      );

      return mapNotificationRouteFromApi(response.data);
    },

    async sendTest(event) {
      const response = await apiRequest<LaravelSuccessResponse<NotificationRouteTestResult>>(
        `/admin/notification-routes/${encodeURIComponent(event)}/test`,
        {
          method: "POST",
        },
      );

      return response.data;
    },
  };
}

export { createApiNotificationRoutesService };
