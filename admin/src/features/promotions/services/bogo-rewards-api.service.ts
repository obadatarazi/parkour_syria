import type {
  BogoRewardListParams,
  BogoRewardsService,
} from "@/features/promotions/services/bogo-rewards.service.types";
import type {
  BogoReward,
  BogoRewardFormData,
} from "@/features/promotions/types/promotions.types";
import { mapBogoRewardFromApi } from "@/features/promotions/utils/map-promotion-from-api";
import {
  apiRequest,
  buildLaravelListParams,
  type LaravelPaginatedResponse,
  type LaravelSuccessResponse,
  mapPaginatedFromApi,
} from "@/shared/lib/api";

function buildPayload(data: Partial<BogoRewardFormData>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (data.bogoPromotionId !== undefined) payload.bogoPromotionId = data.bogoPromotionId;
  if (data.quantity !== undefined) payload.quantity = data.quantity;
  if (data.discountType !== undefined) payload.discountType = data.discountType;
  if (data.discountValue !== undefined) payload.discountValue = data.discountValue;

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

function createApiBogoRewardsService(): BogoRewardsService {
  return {
    async list(params: BogoRewardListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<LaravelPaginatedResponse<BogoReward>>(
        "/admin/bogo-rewards",
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
      return mapPaginatedFromApi(response, mapBogoRewardFromApi);
    },

    async getById(id, signal?: AbortSignal) {
      const response = await apiRequest<LaravelSuccessResponse<BogoReward>>(
        `/admin/bogo-rewards/${id}`,
        { signal },
      );
      return mapBogoRewardFromApi(response.data);
    },

    async create(data) {
      const response = await apiRequest<LaravelSuccessResponse<BogoReward>>(
        "/admin/bogo-rewards",
        { method: "POST", body: buildPayload(data) },
      );
      return mapBogoRewardFromApi(response.data);
    },

    async update(id, data) {
      const response = await apiRequest<LaravelSuccessResponse<BogoReward>>(
        `/admin/bogo-rewards/${id}`,
        { method: "PUT", body: buildPayload(data) },
      );
      return mapBogoRewardFromApi(response.data);
    },

    async delete(id) {
      await apiRequest(`/admin/bogo-rewards/${id}`, { method: "DELETE" });
    },
  };
}

export { createApiBogoRewardsService };
