import type { PromotionsService } from "@/features/promotions/services/promotions.service.types";
import type {
  Promotion,
  PromotionFormData,
  PromotionListParams,
} from "@/features/promotions/types/promotions.types";
import { fromDatetimeLocalValue } from "@/features/promotions/types/promotions.types";
import { mapPromotionFromApi } from "@/features/promotions/utils/map-promotion-from-api";
import { isServiceError, ServiceError } from "@/shared/errors";
import {
  apiRequest,
  buildLaravelListParams,
  type LaravelPaginatedResponse,
  type LaravelSuccessResponse,
  mapPaginatedFromApi,
  postBulkDelete,
} from "@/shared/lib/api";
import type { TranslationsInput } from "@/shared/lib/api/form-data.utils";
import { decodeAdminRouteKey } from "@/shared/lib/routing/admin-route-keys.utils";

/** Admin forms use `title`; promotion API expects `name`. */
function toApiTranslations(translations: TranslationsInput): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const locale of ["en", "ar"] as const) {
    const row = translations[locale];
    if (!row) continue;
    result[locale] = {
      name: row.title ?? "",
      description: row.description ?? "",
    };
  }
  return result;
}

function buildPayload(data: Partial<PromotionFormData>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  if (data.translations !== undefined) {
    payload.translations = toApiTranslations(data.translations);
  }
  if (data.code !== undefined) {
    payload.code = data.code.trim().toUpperCase();
  }
  if (data.type !== undefined) {
    payload.type = data.type;
  }
  if (data.usageLimit !== undefined) {
    payload.usageLimit = data.usageLimit;
  }
  if (data.usageLimitPerUser !== undefined) {
    payload.usageLimitPerUser = data.usageLimitPerUser;
  }
  if (data.startsAt !== undefined) {
    payload.startsAt = fromDatetimeLocalValue(data.startsAt) || null;
  }
  if (data.endsAt !== undefined) {
    payload.endsAt = fromDatetimeLocalValue(data.endsAt) || null;
  }
  if (data.isActive !== undefined) {
    payload.isActive = data.isActive;
  }
  if (data.isRequireLogin !== undefined) {
    payload.isRequireLogin = data.isRequireLogin;
  }
  if (data.priority !== undefined) {
    payload.priority = data.priority;
  }

  return payload;
}

function createApiPromotionsService(): PromotionsService {
  const service: PromotionsService = {
    async list(params: PromotionListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<LaravelPaginatedResponse<Promotion>>("/admin/promotions", {
        signal,
        params: buildLaravelListParams(
          {
            page: params.page,
            limit: params.limit,
            search: params.search,
            code: params.code,
            type: params.type,
            isActive: params.isActive,
            isRequireLogin: params.isRequireLogin,
            isRunning: params.isRunning,
            sort: params.sort,
            direction: params.direction,
          },
          { limit: 20 },
        ),
      });
      return mapPaginatedFromApi(response, mapPromotionFromApi);
    },

    async getById(id, signal?: AbortSignal) {
      const response = await apiRequest<LaravelSuccessResponse<Promotion>>(
        `/admin/promotions/${id}`,
        { signal },
      );
      return mapPromotionFromApi(response.data);
    },

    async getByCodeOrId(idOrCode, signal?: AbortSignal) {
      const raw = String(idOrCode).trim();
      if (!raw) {
        throw new ServiceError("not_found");
      }

      const findByCode = async (code: string): Promise<Promotion> => {
        const normalized = code.toUpperCase();
        const listed = await service.list({ code: normalized, page: 1, limit: 20 }, signal);
        const match = listed.data.find((item) => item.code.toUpperCase() === normalized);
        if (!match) {
          throw new ServiceError("not_found");
        }
        return service.getById(match.id, signal);
      };

      if (!/^\d+$/.test(raw)) {
        return findByCode(raw);
      }

      try {
        return await service.getById(Number(raw), signal);
      } catch (error) {
        if (isServiceError(error) && error.code === "not_found") {
          return findByCode(raw);
        }
        throw error;
      }
    },

    async resolveRouteKey(routeKey, signal?: AbortSignal) {
      const decoded = decodeAdminRouteKey(routeKey) ?? routeKey.trim();
      if (!decoded) {
        throw new ServiceError("not_found");
      }
      return service.getByCodeOrId(decoded, signal);
    },

    async create(data: PromotionFormData) {
      const response = await apiRequest<LaravelSuccessResponse<Promotion>>("/admin/promotions", {
        method: "POST",
        body: buildPayload(data),
      });
      return mapPromotionFromApi(response.data);
    },

    async update(id, data: Partial<PromotionFormData>) {
      const response = await apiRequest<LaravelSuccessResponse<Promotion>>(
        `/admin/promotions/${id}`,
        {
          method: "PUT",
          body: buildPayload(data),
        },
      );
      return mapPromotionFromApi(response.data);
    },

    async delete(id) {
      await apiRequest(`/admin/promotions/${id}`, { method: "DELETE" });
    },

    async bulkDelete(ids) {
      return postBulkDelete("/admin/promotions/bulk-delete", ids);
    },
  };

  return service;
}

export { createApiPromotionsService };
