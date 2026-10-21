import type { LoyaltyRedemptionsService } from "@/features/loyalty-redemptions/services/loyalty-redemptions.service.types";
import type {
  LoyaltyRedemption,
  LoyaltyRedemptionListParams,
} from "@/features/loyalty-redemptions/types/loyalty-redemptions.types";
import { mapLoyaltyRedemptionFromApi } from "@/features/loyalty-redemptions/utils/map-loyalty-redemption-from-api";
import {
  apiRequest,
  buildLaravelListParams,
  type LaravelPaginatedResponse,
  type LaravelSuccessResponse,
  mapPaginatedFromApi,
} from "@/shared/lib/api";

function createApiLoyaltyRedemptionsService(): LoyaltyRedemptionsService {
  return {
    async list(params: LoyaltyRedemptionListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<LaravelPaginatedResponse<LoyaltyRedemption>>(
        "/admin/loyalty-redemptions",
        {
          signal,
          params: buildLaravelListParams(
            {
              page: params.page,
              limit: params.limit,
              search: params.search,
              status: params.status,
              userId: params.userId,
              loyaltyRewardId: params.loyaltyRewardId,
              sort: params.sort,
              direction: params.direction,
            },
            { limit: 20 },
          ),
        },
      );
      return mapPaginatedFromApi(response, mapLoyaltyRedemptionFromApi);
    },

    async getById(id, signal?: AbortSignal) {
      const response = await apiRequest<LaravelSuccessResponse<LoyaltyRedemption>>(
        `/admin/loyalty-redemptions/${id}`,
        { signal },
      );
      return mapLoyaltyRedemptionFromApi(response.data);
    },
  };
}

export { createApiLoyaltyRedemptionsService };
