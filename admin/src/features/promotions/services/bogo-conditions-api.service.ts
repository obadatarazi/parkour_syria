import type {
  BogoConditionListParams,
  BogoConditionsService,
} from "@/features/promotions/services/bogo-conditions.service.types";
import type {
  BogoCondition,
  BogoConditionFormData,
} from "@/features/promotions/types/promotions.types";
import { mapBogoConditionFromApi } from "@/features/promotions/utils/map-promotion-from-api";
import {
  apiRequest,
  buildLaravelListParams,
  type LaravelPaginatedResponse,
  type LaravelSuccessResponse,
  mapPaginatedFromApi,
} from "@/shared/lib/api";

function buildPayload(data: Partial<BogoConditionFormData>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (data.bogoPromotionId !== undefined) payload.bogoPromotionId = data.bogoPromotionId;
  if (data.quantity !== undefined) payload.quantity = data.quantity;

  // Exactly one of productId / productVariantId.
  if (data.productVariantId != null) {
    payload.productVariantId = data.productVariantId;
    payload.productId = null;
  } else if (data.productId != null) {
    payload.productId = data.productId;
    payload.productVariantId = null;
  } else if (data.productId === null || data.productVariantId === null) {
    if (data.productId !== undefined) payload.productId = data.productId;
    if (data.productVariantId !== undefined) payload.productVariantId = data.productVariantId;
  }

  return payload;
}

function createApiBogoConditionsService(): BogoConditionsService {
  return {
    async list(params: BogoConditionListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<LaravelPaginatedResponse<BogoCondition>>(
        "/admin/bogo-conditions",
        {
          signal,
          params: buildLaravelListParams(
            {
              page: params.page,
              limit: params.limit,
              bogoPromotionId: params.bogoPromotionId,
              productId: params.productId,
              productVariantId: params.productVariantId,
              sort: params.sort,
              direction: params.direction,
            },
            { limit: 50 },
          ),
        },
      );
      return mapPaginatedFromApi(response, mapBogoConditionFromApi);
    },

    async getById(id, signal?: AbortSignal) {
      const response = await apiRequest<LaravelSuccessResponse<BogoCondition>>(
        `/admin/bogo-conditions/${id}`,
        { signal },
      );
      return mapBogoConditionFromApi(response.data);
    },

    async create(data) {
      const response = await apiRequest<LaravelSuccessResponse<BogoCondition>>(
        "/admin/bogo-conditions",
        { method: "POST", body: buildPayload(data) },
      );
      return mapBogoConditionFromApi(response.data);
    },

    async update(id, data) {
      const response = await apiRequest<LaravelSuccessResponse<BogoCondition>>(
        `/admin/bogo-conditions/${id}`,
        { method: "PUT", body: buildPayload(data) },
      );
      return mapBogoConditionFromApi(response.data);
    },

    async delete(id) {
      await apiRequest(`/admin/bogo-conditions/${id}`, { method: "DELETE" });
    },
  };
}

export { createApiBogoConditionsService };
