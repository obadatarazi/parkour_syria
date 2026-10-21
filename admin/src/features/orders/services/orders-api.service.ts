import type { OrdersService } from "@/features/orders/services/orders.service.types";
import type {
  Order,
  OrderFormData,
  OrderListParams,
  OrderPackingSlipDownload,
  OrderStats,
} from "@/features/orders/types/orders.types";
import {
  buildOrderCreatePayload,
  buildOrderUpdatePayload,
} from "@/features/orders/types/orders.types";
import { mapOrderFromApi } from "@/features/orders/utils/map-order-from-api";
import {
  apiRequest,
  buildLaravelListParams,
  type LaravelPaginatedResponse,
  type LaravelSuccessResponse,
  mapLaravelPagination,
} from "@/shared/lib/api";
import {
  decodeAdminRouteKey,
  isNumericAdminRouteKey,
} from "@/shared/lib/routing/admin-route-keys.utils";
import { ServiceError } from "@/shared/errors";

function createApiOrdersService(): OrdersService {
  const service: OrdersService = {
    async list(params: OrderListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<LaravelPaginatedResponse<Order>>("/admin/orders", {
        signal,
        params: buildLaravelListParams(
          {
            page: params.page,
            limit: params.limit,
            search: params.search,
            userId: params.userId,
            orderRefNumber: params.orderRefNumber,
            status: params.status,
            createdBy: params.createdBy,
            source: params.source,
            hasDiscount: params.hasDiscount,
            invoiceStatus: params.invoiceStatus,
            paymentProvider: params.paymentProvider,
            sort: params.sort,
            direction: params.direction,
          },
          { limit: 20 },
        ),
      });
      const page = mapLaravelPagination(response);
      return { ...page, data: page.data.map(mapOrderFromApi) };
    },

    async getById(id) {
      const response = await apiRequest<LaravelSuccessResponse<Order>>(`/admin/orders/${id}`);
      return mapOrderFromApi(response.data);
    },

    async getByRefNumber(orderRefNumber, signal?: AbortSignal) {
      const response = await apiRequest<LaravelSuccessResponse<Order>>(
        `/admin/orders/ref-number/${encodeURIComponent(orderRefNumber)}`,
        { signal },
      );
      return mapOrderFromApi(response.data);
    },

    async resolveRouteKey(routeKey, signal?: AbortSignal) {
      const decoded = decodeAdminRouteKey(routeKey) ?? routeKey.trim();
      if (!decoded) {
        throw new ServiceError("not_found");
      }
      if (isNumericAdminRouteKey(decoded)) {
        return service.getById(Number(decoded));
      }
      return service.getByRefNumber(decoded, signal);
    },

    async getStats(signal?: AbortSignal) {
      const response = await apiRequest<LaravelSuccessResponse<OrderStats>>("/admin/orders/stats", {
        signal,
      });
      return {
        needsActionCount: Number(response.data?.needsActionCount ?? 0),
      };
    },

    async create(data: OrderFormData) {
      const response = await apiRequest<LaravelSuccessResponse<Order>>("/admin/orders", {
        method: "POST",
        body: buildOrderCreatePayload(data),
      });
      return mapOrderFromApi(response.data);
    },

    async update(id, data, original) {
      if (!original) {
        throw new Error("Original order form data is required for update.");
      }
      const payload = buildOrderUpdatePayload(original, data as OrderFormData);
      const response = await apiRequest<LaravelSuccessResponse<Order>>(`/admin/orders/${id}`, {
        method: "PUT",
        body: payload,
      });
      return mapOrderFromApi(response.data);
    },

    async downloadPackingSlip(orderRefNumber) {
      const response = await apiRequest<LaravelSuccessResponse<OrderPackingSlipDownload>>(
        `/admin/orders/${encodeURIComponent(orderRefNumber)}/packing-slip`,
      );
      return response.data;
    },
  };

  return service;
}

export { createApiOrdersService };
