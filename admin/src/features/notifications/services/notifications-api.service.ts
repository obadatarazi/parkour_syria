import type { NotificationsService } from "@/features/notifications/services/notifications.service.types";
import type {
  Notification,
  NotificationFormData,
  NotificationListParams,
  NotificationTranslations,
} from "@/features/notifications/types/notifications.types";
import { mapNotificationFromApi } from "@/features/notifications/utils/map-notification-from-api";
import {
  apiRequest,
  buildLaravelListParams,
  mapPaginatedFromApi,
  type LaravelPaginatedResponse,
  type LaravelSuccessResponse,
} from "@/shared/lib/api";

function buildTranslationsPayload(
  translations: NotificationTranslations | undefined,
): Record<string, { title: string; body?: string }> | undefined {
  if (!translations) return undefined;

  const payload: Record<string, { title: string; body?: string }> = {};
  for (const [locale, translation] of Object.entries(translations)) {
    if (!translation) continue;
    payload[locale] = {
      title: translation.title?.trim() ?? "",
      body: translation.body?.trim() || undefined,
    };
  }
  return Object.keys(payload).length > 0 ? payload : undefined;
}

function buildPayload(data: Partial<NotificationFormData>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  if (data.type !== undefined && data.type !== "") {
    payload.type = data.type;
  }
  if (data.read !== undefined) {
    payload.read = data.read;
  }
  if (data.userIds !== undefined) {
    payload.users = data.userIds;
  }
  if (data.translations !== undefined) {
    payload.translations = buildTranslationsPayload(data.translations);
  }

  return payload;
}

function createApiNotificationsService(): NotificationsService {
  return {
    async list(params: NotificationListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<LaravelPaginatedResponse<Notification>>(
        "/admin/notifications",
        {
          signal,
          params: buildLaravelListParams(
            {
              page: params.page,
              limit: params.limit,
              read: params.read,
              type: params.type,
              userId: params.userId,
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
        `/admin/notifications/${id}`,
        { signal },
      );
      return mapNotificationFromApi(response.data);
    },

    async create(data: NotificationFormData) {
      const response = await apiRequest<LaravelSuccessResponse<Notification>>(
        "/admin/notifications",
        {
          method: "POST",
          body: buildPayload(data),
        },
      );
      return mapNotificationFromApi(response.data);
    },

    async update(id, data: Partial<NotificationFormData>) {
      const response = await apiRequest<LaravelSuccessResponse<Notification>>(
        `/admin/notifications/${id}`,
        {
          method: "PUT",
          body: buildPayload(data),
        },
      );
      return mapNotificationFromApi(response.data);
    },

    async delete(id) {
      await apiRequest(`/admin/notifications/${id}`, { method: "DELETE" });
    },
  };
}

export { createApiNotificationsService };
