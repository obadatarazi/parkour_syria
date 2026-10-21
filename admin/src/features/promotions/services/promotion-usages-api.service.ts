import type { PromotionUsagesService } from "@/features/promotions/services/promotion-usages.service.types";
import type {
  PromotionUsage,
  PromotionUsageListParams,
} from "@/features/promotions/types/promotions.types";
import { mapPromotionUsageFromApi } from "@/features/promotions/utils/map-promotion-usage-from-api";
import {
  apiRequest,
  buildLaravelListParams,
  type LaravelPaginatedResponse,
  type LaravelSuccessResponse,
  mapPaginatedFromApi,
} from "@/shared/lib/api";

function createApiPromotionUsagesService(): PromotionUsagesService {
  return {
    async list(params: PromotionUsageListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<LaravelPaginatedResponse<PromotionUsage>>(
        "/admin/promotion-usages",
        {
          signal,
          params: buildLaravelListParams(
            {
              page: params.page,
              limit: params.limit,
              search: params.search,
              promotionId: params.promotionId,
              userId: params.userId,
              orderId: params.orderId,
              cartUuid: params.cartUuid,
              code: params.code,
              usedFrom: params.usedFrom,
              usedTo: params.usedTo,
              sort: params.sort,
              direction: params.direction,
            },
            { limit: 20 },
          ),
        },
      );
      return mapPaginatedFromApi(response, mapPromotionUsageFromApi);
    },

    async getById(id, signal?: AbortSignal) {
      const response = await apiRequest<LaravelSuccessResponse<PromotionUsage>>(
        `/admin/promotion-usages/${id}`,
        { signal },
      );
      return mapPromotionUsageFromApi(response.data);
    },
  };
}

export { createApiPromotionUsagesService };
