import type {
  BogoPromotionListParams,
  BogoPromotionsService,
} from "@/features/promotions/services/bogo-promotions.service.types";
import type {
  BogoPromotion,
  BogoPromotionFormData,
} from "@/features/promotions/types/promotions.types";
import { mapBogoPromotionFromApi } from "@/features/promotions/utils/map-promotion-from-api";
import {
  apiRequest,
  buildLaravelListParams,
  type LaravelPaginatedResponse,
  type LaravelSuccessResponse,
  mapPaginatedFromApi,
} from "@/shared/lib/api";

function buildPayload(data: Partial<BogoPromotionFormData>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (data.promotionId !== undefined) payload.promotionId = data.promotionId;
  if (data.buyQuantity !== undefined) payload.buyQuantity = data.buyQuantity;
  if (data.getQuantity !== undefined) payload.getQuantity = data.getQuantity;
  if (data.maxRewards !== undefined) payload.maxRewards = data.maxRewards;
  return payload;
}

function createApiBogoPromotionsService(): BogoPromotionsService {
  return {
    async list(params: BogoPromotionListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<LaravelPaginatedResponse<BogoPromotion>>(
        "/admin/bogo-promotions",
        {
          signal,
          params: buildLaravelListParams(
            {
              page: params.page,
              limit: params.limit,
              promotionId: params.promotionId,
              buyQuantity: params.buyQuantity,
              getQuantity: params.getQuantity,
              sort: params.sort,
              direction: params.direction,
            },
            { limit: 50 },
          ),
        },
      );
      return mapPaginatedFromApi(response, mapBogoPromotionFromApi);
    },

    async getById(id, signal?: AbortSignal) {
      const response = await apiRequest<LaravelSuccessResponse<BogoPromotion>>(
        `/admin/bogo-promotions/${id}`,
        { signal },
      );
      return mapBogoPromotionFromApi(response.data);
    },

    async create(data) {
      const response = await apiRequest<LaravelSuccessResponse<BogoPromotion>>(
        "/admin/bogo-promotions",
        { method: "POST", body: buildPayload(data) },
      );
      return mapBogoPromotionFromApi(response.data);
    },

    async update(id, data) {
      const response = await apiRequest<LaravelSuccessResponse<BogoPromotion>>(
        `/admin/bogo-promotions/${id}`,
        { method: "PUT", body: buildPayload(data) },
      );
      return mapBogoPromotionFromApi(response.data);
    },

    async delete(id) {
      await apiRequest(`/admin/bogo-promotions/${id}`, { method: "DELETE" });
    },
  };
}

export { createApiBogoPromotionsService };
