import type { MeNotificationsService } from "@/features/notifications/services/me-notifications.service.types";
import type {
  Notification,
  NotificationListParams,
} from "@/features/notifications/types/notifications.types";
import { mapNotificationFromApi } from "@/features/notifications/utils/map-notification-from-api";
import {
  apiRequest,
  buildLaravelListParams,
  type LaravelPaginatedResponse,
  type LaravelSuccessResponse,
  mapPaginatedFromApi,
} from "@/shared/lib/api";

function createApiMeNotificationsService(): MeNotificationsService {
  return {
    async list(params: NotificationListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<LaravelPaginatedResponse<Notification>>(
        "/admin/me/notifications",
        {
          signal,
          params: buildLaravelListParams(
            {
              page: params.page,
              limit: params.limit,
              read: params.read,
              type: params.type,
              sort: params.sort,
              direction: params.direction,
            },
            { limit: 20 },
          ),
        },
      );
      return mapPaginatedFromApi(response, mapNotificationFromApi);
    },

    async getById(id, signal?: AbortSignal) {
      const response = await apiRequest<LaravelSuccessResponse<Notification>>(
        `/admin/me/notifications/${id}`,
        { signal },
      );
      return mapNotificationFromApi(response.data);
    },

    async markRead(id, _read = true) {
      const response = await apiRequest<LaravelSuccessResponse<Notification>>(
        `/admin/me/notifications/${id}`,
        {
          method: "PUT",
          // Backend Me update only accepts marking as read (never unread).
          body: { read: true },
        },
      );
      return mapNotificationFromApi(response.data);
    },

    async markAllRead() {
      const response = await apiRequest<
        LaravelSuccessResponse<{ message?: string; unreadCount?: number }>
      >("/admin/me/notifications/read-all", { method: "GET" });

      const unreadCount = response.data?.unreadCount;
      return {
        unreadCount:
          typeof unreadCount === "number" && Number.isFinite(unreadCount)
            ? Math.max(0, unreadCount)
            : 0,
      };
    },
  };
}

export { createApiMeNotificationsService };
