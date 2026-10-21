import type { DeliveryZonesPricesService } from "@/features/delivery-zones-prices/services/delivery-zones-prices.service.types";
import type {
  DeliveryZonesPrice,
  DeliveryZonesPriceFormData,
  DeliveryZonesPriceListParams,
} from "@/features/delivery-zones-prices/types/delivery-zones-prices.types";
import { mapDeliveryZonesPriceFromApi } from "@/features/delivery-zones-prices/utils/map-delivery-zones-price-from-api";
import {
  apiRequest,
  buildLaravelListParams,
  type LaravelPaginatedResponse,
  type LaravelSuccessResponse,
  mapPaginatedFromApi,
  postBulkDelete,
} from "@/shared/lib/api";

function buildPayload(data: Partial<DeliveryZonesPriceFormData>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (data.stateId !== undefined) {
    payload.stateId = data.stateId;
  }
  if (data.deliveryFee !== undefined) {
    payload.deliveryFee = data.deliveryFee;
  }
  if (data.publish !== undefined) {
    payload.publish = data.publish;
  }
  return payload;
}

function createApiDeliveryZonesPricesService(): DeliveryZonesPricesService {
  return {
    async list(params: DeliveryZonesPriceListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<LaravelPaginatedResponse<DeliveryZonesPrice>>(
        "/admin/delivery-zones-prices",
        {
        signal,
          params: buildLaravelListParams(
            {
              page: params.page,
              limit: params.limit,
              search: params.search,
              publish: params.publish,
              stateId: params.stateId,
              sort: params.sort,
              direction: params.direction,
            },
            { limit: 20 },
          ),
        },
      );
      return mapPaginatedFromApi(response, mapDeliveryZonesPriceFromApi);
    },

    async getById(id, signal?: AbortSignal) {
      const response = await apiRequest<LaravelSuccessResponse<DeliveryZonesPrice>>(
        `/admin/delivery-zones-prices/${id}`,
        { signal },
      );
      return mapDeliveryZonesPriceFromApi(response.data);
    },

    async create(data: DeliveryZonesPriceFormData) {
      const response = await apiRequest<LaravelSuccessResponse<DeliveryZonesPrice>>(
        "/admin/delivery-zones-prices",
        {
          method: "POST",
          body: buildPayload(data),
        },
      );
      return mapDeliveryZonesPriceFromApi(response.data);
    },

    async update(id, data: Partial<DeliveryZonesPriceFormData>) {
      const response = await apiRequest<LaravelSuccessResponse<DeliveryZonesPrice>>(
        `/admin/delivery-zones-prices/${id}`,
        {
          method: "PUT",
          body: buildPayload(data),
        },
      );
      return mapDeliveryZonesPriceFromApi(response.data);
    },

    async delete(id) {
      await apiRequest(`/admin/delivery-zones-prices/${id}`, { method: "DELETE" });
    },

    async bulkDelete(ids) {
      return postBulkDelete("/admin/delivery-zones-prices/bulk-delete", ids);
    },
  };
}

export { createApiDeliveryZonesPricesService };
