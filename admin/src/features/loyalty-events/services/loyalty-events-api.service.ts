import type { LoyaltyEventsService } from "@/features/loyalty-events/services/loyalty-events.service.types";
import type {
  LoyaltyEvent,
  LoyaltyEventFormData,
  LoyaltyEventListParams,
} from "@/features/loyalty-events/types/loyalty-events.types";
import { mapLoyaltyEventFromApi } from "@/features/loyalty-events/utils/map-loyalty-event-from-api";
import {
  apiRequest,
  buildLaravelListParams,
  type LaravelPaginatedResponse,
  type LaravelSuccessResponse,
  mapPaginatedFromApi,
  postBulkDelete,
} from "@/shared/lib/api";
import { mapLoyaltyTranslationsToApi } from "@/shared/lib/loyalty/loyalty-translations.utils";

function buildPayload(data: Partial<LoyaltyEventFormData>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  if (data.translations !== undefined) {
    payload.translations = mapLoyaltyTranslationsToApi(data.translations);
  }
  if (data.code !== undefined) {
    payload.code = data.code.trim();
  }
  if (data.type !== undefined) {
    payload.type = data.type;
  }
  if (data.points !== undefined) {
    payload.points = data.points;
  }
  if (data.maxTimes !== undefined) {
    payload.maxTimes = data.maxTimes;
  }
  if (data.isActive !== undefined) {
    payload.isActive = data.isActive;
  }

  return payload;
}

function createApiLoyaltyEventsService(): LoyaltyEventsService {
  return {
    async list(params: LoyaltyEventListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<LaravelPaginatedResponse<LoyaltyEvent>>(
        "/admin/loyalty-events",
        {
          signal,
          params: buildLaravelListParams(
            {
              page: params.page,
              limit: params.limit,
              search: params.search,
              code: params.code,
              type: params.type,
              isActive: params.isActive,
              sort: params.sort,
              direction: params.direction,
            },
            { limit: 20 },
          ),
        },
      );
      return mapPaginatedFromApi(response, mapLoyaltyEventFromApi);
    },

    async getById(id, signal?: AbortSignal) {
      const response = await apiRequest<LaravelSuccessResponse<LoyaltyEvent>>(
        `/admin/loyalty-events/${id}`,
        { signal },
      );
      return mapLoyaltyEventFromApi(response.data);
    },

    async create(data: LoyaltyEventFormData) {
      const response = await apiRequest<LaravelSuccessResponse<LoyaltyEvent>>(
        "/admin/loyalty-events",
        {
          method: "POST",
          body: buildPayload(data),
        },
      );
      return mapLoyaltyEventFromApi(response.data);
    },

    async update(id, data: Partial<LoyaltyEventFormData>) {
      const response = await apiRequest<LaravelSuccessResponse<LoyaltyEvent>>(
        `/admin/loyalty-events/${id}`,
        {
          method: "PUT",
          body: buildPayload(data),
        },
      );
      return mapLoyaltyEventFromApi(response.data);
    },

    async delete(id) {
      await apiRequest(`/admin/loyalty-events/${id}`, { method: "DELETE" });
    },

    async bulkDelete(ids) {
      return postBulkDelete("/admin/loyalty-events/bulk-delete", ids);
    },
  };
}

export { createApiLoyaltyEventsService };
