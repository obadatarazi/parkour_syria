import type { LoyaltyRewardsService } from "@/features/loyalty-rewards/services/loyalty-rewards.service.types";
import type {
  LoyaltyReward,
  LoyaltyRewardFormData,
  LoyaltyRewardListParams,
} from "@/features/loyalty-rewards/types/loyalty-rewards.types";
import { mapLoyaltyRewardFromApi } from "@/features/loyalty-rewards/utils/map-loyalty-reward-from-api";
import {
  apiRequest,
  buildLaravelListParams,
  type LaravelPaginatedResponse,
  type LaravelSuccessResponse,
  mapPaginatedFromApi,
  postBulkDelete,
} from "@/shared/lib/api";
import { mapLoyaltyTranslationsToApi } from "@/shared/lib/loyalty/loyalty-translations.utils";

function buildConditionsPayload(
  minimumCartTotal: number | null | undefined,
): Record<string, number> | null {
  if (minimumCartTotal == null || minimumCartTotal <= 0) return null;
  return { minimum_total_price: minimumCartTotal };
}

function buildPayload(data: Partial<LoyaltyRewardFormData>): Record<string, unknown> {
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
  if (data.pointsCost !== undefined) {
    payload.pointsCost = data.pointsCost;
  }
  if (data.rewardValue !== undefined || data.type === "FREE_SHIPPING") {
    payload.rewardValue =
      data.type === "FREE_SHIPPING" ? null : (data.rewardValue ?? null);
  }
  if (data.usageLimit !== undefined) {
    payload.usageLimit = data.usageLimit;
  }
  if (data.expiresAfterDays !== undefined) {
    payload.expiresAfterDays = data.expiresAfterDays;
  }
  if (data.isActive !== undefined) {
    payload.isActive = data.isActive;
  }
  if (data.minimumCartTotal !== undefined) {
    payload.conditions = buildConditionsPayload(data.minimumCartTotal);
  }

  return payload;
}

function createApiLoyaltyRewardsService(): LoyaltyRewardsService {
  return {
    async list(params: LoyaltyRewardListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<LaravelPaginatedResponse<LoyaltyReward>>(
        "/admin/loyalty-rewards",
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
      return mapPaginatedFromApi(response, mapLoyaltyRewardFromApi);
    },

    async getById(id, signal?: AbortSignal) {
      const response = await apiRequest<LaravelSuccessResponse<LoyaltyReward>>(
        `/admin/loyalty-rewards/${id}`,
        { signal },
      );
      return mapLoyaltyRewardFromApi(response.data);
    },

    async create(data: LoyaltyRewardFormData) {
      const response = await apiRequest<LaravelSuccessResponse<LoyaltyReward>>(
        "/admin/loyalty-rewards",
        {
          method: "POST",
          body: buildPayload(data),
        },
      );
      return mapLoyaltyRewardFromApi(response.data);
    },

    async update(id, data: Partial<LoyaltyRewardFormData>) {
      const response = await apiRequest<LaravelSuccessResponse<LoyaltyReward>>(
        `/admin/loyalty-rewards/${id}`,
        {
          method: "PUT",
          body: buildPayload(data),
        },
      );
      return mapLoyaltyRewardFromApi(response.data);
    },

    async delete(id) {
      await apiRequest(`/admin/loyalty-rewards/${id}`, { method: "DELETE" });
    },

    async bulkDelete(ids) {
      return postBulkDelete("/admin/loyalty-rewards/bulk-delete", ids);
    },
  };
}

export { createApiLoyaltyRewardsService };
