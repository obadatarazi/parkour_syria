import type { OrderItemsService } from "@/features/order-items/services/order-items.service.types";
import type { OrderItem, OrderItemListParams } from "@/features/order-items/types/order-items.types";
import { mapOrderItemFromApi } from "@/features/order-items/utils/map-order-item-from-api";
import {
  apiRequest,
  buildLaravelListParams,
  type LaravelPaginatedResponse,
  type LaravelSuccessResponse,
  mapLaravelPagination,
} from "@/shared/lib/api";

function createApiOrderItemsService(): OrderItemsService {
  return {
    async list(params: OrderItemListParams = {}, signal?: AbortSignal) {
      // Backend has no full-text searchColumns on order items; map UI search → productTitle LIKE.
      const productTitle = params.productTitle?.trim() || params.search?.trim() || undefined;

      const response = await apiRequest<LaravelPaginatedResponse<OrderItem>>(
        "/admin/order-items",
        {
          signal,
          params: buildLaravelListParams(
            {
              page: params.page,
              limit: params.limit,
              orderId: params.orderId,
              orderRefNumber: params.orderRefNumber,
              productId: params.productId,
              productVariantId: params.productVariantId,
              productTitle,
              minQuantity: params.minQuantity,
              maxQuantity: params.maxQuantity,
              sort: params.sort,
              direction: params.direction,
            },
            { limit: 20 },
          ),
        },
      );
      const page = mapLaravelPagination(response);
      return { ...page, data: page.data.map(mapOrderItemFromApi) };
    },

    async getById(id) {
      const response = await apiRequest<LaravelSuccessResponse<OrderItem>>(
        `/admin/order-items/${id}`,
      );
      return mapOrderItemFromApi(response.data);
    },
  };
}

export { createApiOrderItemsService };
