import type { HolidaysService } from "@/features/holidays/services/holidays.service.types";
import type {
  Holiday,
  HolidayFormData,
  HolidayListParams,
} from "@/features/holidays/types/holidays.types";
import { mapHolidayFromApi } from "@/features/holidays/utils/map-holiday-from-api";
import {
  apiRequest,
  buildLaravelListParams,
  type LaravelPaginatedResponse,
  type LaravelSuccessResponse,
  mapPaginatedFromApi,
  postBulkDelete,
} from "@/shared/lib/api";

function buildPayload(data: Partial<HolidayFormData>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (data.date !== undefined) {
    payload.date = data.date;
  }
  if (data.name !== undefined) {
    payload.name = data.name;
  }
  if (data.description !== undefined) {
    payload.description = data.description;
  }
  if (data.isActive !== undefined) {
    payload.isActive = data.isActive;
  }
  return payload;
}

function createApiHolidaysService(): HolidaysService {
  return {
    async list(params: HolidayListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<LaravelPaginatedResponse<Holiday>>(
        "/admin/holidays",
        {
          signal,
          params: buildLaravelListParams(
            {
              page: params.page,
              limit: params.limit,
              search: params.search,
              isActive: params.isActive,
              date: params.date,
              fromDate: params.fromDate,
              toDate: params.toDate,
              sort: params.sort,
              direction: params.direction,
            },
            { limit: 20 },
          ),
        },
      );
      return mapPaginatedFromApi(response, mapHolidayFromApi);
    },

    async getById(id, signal?: AbortSignal) {
      const response = await apiRequest<LaravelSuccessResponse<Holiday>>(
        `/admin/holidays/${id}`,
        { signal },
      );
      return mapHolidayFromApi(response.data);
    },

    async create(data: HolidayFormData) {
      const response = await apiRequest<LaravelSuccessResponse<Holiday>>(
        "/admin/holidays",
        {
          method: "POST",
          body: buildPayload(data),
        },
      );
      return mapHolidayFromApi(response.data);
    },

    async update(id, data: Partial<HolidayFormData>) {
      const response = await apiRequest<LaravelSuccessResponse<Holiday>>(
        `/admin/holidays/${id}`,
        {
          method: "PUT",
          body: buildPayload(data),
        },
      );
      return mapHolidayFromApi(response.data);
    },

    async delete(id) {
      await apiRequest(`/admin/holidays/${id}`, { method: "DELETE" });
    },

    async bulkDelete(ids) {
      return postBulkDelete("/admin/holidays/bulk-delete", ids);
    },
  };
}

export { createApiHolidaysService };
