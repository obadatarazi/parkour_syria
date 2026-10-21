import type { CarePlansService } from "@/features/care-plans/services/care-plans.service.types";
import type {
  CarePlan,
  CarePlanAwaitingPaymentWidgetItem,
  CarePlanFormData,
  CarePlanListParams,
  CarePlanOutOfStockWidgetItem,
  CarePlanTopProductWidgetItem,
} from "@/features/care-plans/types/care-plans.types";
import { mapCarePlanFromApi } from "@/features/care-plans/utils/map-care-plan-from-api";
import {
  apiRequest,
  buildLaravelListParams,
  type LaravelPaginatedResponse,
  type LaravelSuccessResponse,
  mapPaginatedFromApi,
} from "@/shared/lib/api";

function buildItemsPayload(items: CarePlanFormData["items"]) {
  return items
    .filter((item) => item.productId != null)
    .map((item, index) => ({
      productId: item.productId,
      productVariantId: item.productVariantId,
      quantity: item.quantity,
      sortOrder: item.sortOrder ?? index,
    }));
}

function buildPayload(data: Partial<CarePlanFormData>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  if (data.userId !== undefined) {
    payload.userId = data.userId;
  }
  if (data.userAddressId !== undefined) {
    payload.userAddressId = data.userAddressId;
  }
  if (data.deliveryZonePriceId !== undefined) {
    payload.deliveryZonePriceId = data.deliveryZonePriceId;
  }
  if (data.paymentProviderId !== undefined) {
    payload.paymentProviderId = data.paymentProviderId;
  }
  if (data.frequency !== undefined) {
    payload.frequency = data.frequency || null;
  }
  if (data.preferredWeekday !== undefined) {
    payload.preferredWeekday = data.preferredWeekday;
  }
  if (data.items !== undefined) {
    payload.items = buildItemsPayload(data.items);
  }

  return payload;
}

function createApiCarePlansService(): CarePlansService {
  return {
    async list(params: CarePlanListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<LaravelPaginatedResponse<CarePlan>>("/admin/care-plans", {
        signal,
        params: buildLaravelListParams(
          {
            page: params.page,
            limit: params.limit,
            search: params.search,
            userId: params.userId,
            status: params.status,
            frequency: params.frequency,
            paymentProviderId: params.paymentProviderId,
            sort: params.sort,
            direction: params.direction,
          },
          { limit: 20 },
        ),
      });
      return mapPaginatedFromApi(response, mapCarePlanFromApi);
    },

    async getById(id, signal?: AbortSignal) {
      const response = await apiRequest<LaravelSuccessResponse<CarePlan>>(
        `/admin/care-plans/${id}`,
        { signal },
      );
      return mapCarePlanFromApi(response.data);
    },

    async create(data: CarePlanFormData) {
      const response = await apiRequest<LaravelSuccessResponse<CarePlan>>("/admin/care-plans", {
        method: "POST",
        body: buildPayload(data),
      });
      return mapCarePlanFromApi(response.data);
    },

    async update(id, data: Partial<CarePlanFormData>) {
      const response = await apiRequest<LaravelSuccessResponse<CarePlan>>(
        `/admin/care-plans/${id}`,
        {
          method: "PUT",
          body: buildPayload(data),
        },
      );
      return mapCarePlanFromApi(response.data);
    },

    async delete(id) {
      await apiRequest(`/admin/care-plans/${id}`, { method: "DELETE" });
    },

    async pause(id) {
      const response = await apiRequest<LaravelSuccessResponse<CarePlan>>(
        `/admin/care-plans/${id}/pause`,
        { method: "POST" },
      );
      return mapCarePlanFromApi(response.data);
    },

    async resume(id) {
      const response = await apiRequest<LaravelSuccessResponse<CarePlan>>(
        `/admin/care-plans/${id}/resume`,
        { method: "POST" },
      );
      return mapCarePlanFromApi(response.data);
    },

    async cancel(id) {
      const response = await apiRequest<LaravelSuccessResponse<CarePlan>>(
        `/admin/care-plans/${id}/cancel`,
        { method: "POST" },
      );
      return mapCarePlanFromApi(response.data);
    },

    async skipCycle(carePlanId, cycleId) {
      const response = await apiRequest<LaravelSuccessResponse<CarePlan>>(
        `/admin/care-plans/${carePlanId}/cycles/${cycleId}/skip`,
        { method: "POST" },
      );
      return mapCarePlanFromApi(response.data);
    },

    async getWidgets(signal?: AbortSignal) {
      const [outOfStock, topProducts, awaitingPayment] = await Promise.all([
        apiRequest<LaravelSuccessResponse<CarePlanOutOfStockWidgetItem[]>>(
          "/admin/care-plans/widgets/out-of-stock",
          { signal },
        ),
        apiRequest<LaravelSuccessResponse<CarePlanTopProductWidgetItem[]>>(
          "/admin/care-plans/widgets/top-products",
          { signal },
        ),
        apiRequest<LaravelSuccessResponse<CarePlanAwaitingPaymentWidgetItem[]>>(
          "/admin/care-plans/widgets/awaiting-payment",
          { signal },
        ),
      ]);

      return {
        outOfStock: outOfStock.data ?? [],
        topProducts: topProducts.data ?? [],
        awaitingPayment: awaitingPayment.data ?? [],
      };
    },
  };
}

export { createApiCarePlansService };
