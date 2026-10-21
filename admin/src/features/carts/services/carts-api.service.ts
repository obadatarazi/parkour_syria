import type { CartsService } from "@/features/carts/services/carts.service.types";
import type {
  AdminCart,
  CartListParams,
  CartStats,
} from "@/features/carts/types/carts.types";
import { mapCartFromApi } from "@/features/carts/utils/map-cart-from-api";
import {
  apiRequest,
  buildLaravelListParams,
  type LaravelPaginatedResponse,
  type LaravelSuccessResponse,
  mapPaginatedFromApi,
} from "@/shared/lib/api";

function createApiCartsService(): CartsService {
  return {
    async list(params: CartListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<LaravelPaginatedResponse<AdminCart>>("/admin/carts", {
        signal,
        params: buildLaravelListParams(
          {
            page: params.page,
            limit: params.limit,
            search: params.search,
            conversionStatus: params.conversionStatus,
            guest: params.guest,
            userId: params.userId,
            cartUuid: params.cartUuid,
            sort: params.sort,
            direction: params.direction,
          },
          { limit: 20 },
        ),
      });
      return mapPaginatedFromApi(response, mapCartFromApi);
    },

    async getById(id, signal?: AbortSignal) {
      const response = await apiRequest<LaravelSuccessResponse<AdminCart>>(`/admin/carts/${id}`, {
        signal,
      });
      return mapCartFromApi(response.data);
    },

    async getStats(signal?: AbortSignal) {
      const response = await apiRequest<LaravelSuccessResponse<CartStats>>("/admin/carts/stats", {
        signal,
      });
      return response.data;
    },
  };
}

export { createApiCartsService };
