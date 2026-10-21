import type { PaymentProvidersService } from "@/features/payment-providers/services/payment-providers.service.types";
import type {
  PaymentProvider,
  PaymentProviderFormData,
  PaymentProviderListParams,
} from "@/features/payment-providers/types/payment-providers.types";
import { mapPaymentProviderFromApi } from "@/features/payment-providers/utils/map-payment-provider-from-api";
import {
  apiRequest,
  appendBoolean,
  appendFile,
  appendOptional,
  appendTranslations,
  buildLaravelListParams,
  type LaravelPaginatedResponse,
  type LaravelSuccessResponse,
  mapPaginatedFromApi,
  postBulkDelete,
  submitMultipartFormData,
} from "@/shared/lib/api";

function buildPaymentProviderFormData(data: Partial<PaymentProviderFormData>): FormData {
  const formData = new FormData();
  if (data.translations) {
    appendTranslations(formData, data.translations);
  }
  appendOptional(formData, "type", data.type);
  if (data.publish !== undefined) {
    appendBoolean(formData, "publish", data.publish);
  }
  if (data.standard !== undefined) {
    appendBoolean(formData, "standard", data.standard);
  }
  if (data.image) {
    appendFile(formData, "image", data.image);
  }
  return formData;
}

function createApiPaymentProvidersService(): PaymentProvidersService {
  return {
    async list(params: PaymentProviderListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<LaravelPaginatedResponse<PaymentProvider>>(
        "/admin/payment-providers",
        {
          signal,
          params: buildLaravelListParams(
            {
              page: params.page,
              limit: params.limit,
              search: params.search,
              publish: params.publish,
              standard: params.standard,
              type: params.type,
              sort: params.sort,
              direction: params.direction,
            },
            { limit: 20 },
          ),
        },
      );
      return mapPaginatedFromApi(response, mapPaymentProviderFromApi);
    },

    async getById(id) {
      const response = await apiRequest<LaravelSuccessResponse<PaymentProvider>>(
        `/admin/payment-providers/${id}`,
      );
      return mapPaymentProviderFromApi(response.data);
    },

    async create(data: PaymentProviderFormData) {
      const response = await apiRequest<LaravelSuccessResponse<PaymentProvider>>(
        "/admin/payment-providers",
        {
          method: "POST",
          body: buildPaymentProviderFormData(data),
        },
      );
      return mapPaymentProviderFromApi(response.data);
    },

    async update(id, data: Partial<PaymentProviderFormData>) {
      const formData = buildPaymentProviderFormData(data);
      const { method, body } = submitMultipartFormData(formData, "PUT");
      const response = await apiRequest<LaravelSuccessResponse<PaymentProvider>>(
        `/admin/payment-providers/${id}`,
        {
          method,
          body,
        },
      );
      return mapPaymentProviderFromApi(response.data);
    },

    async delete(id) {
      await apiRequest(`/admin/payment-providers/${id}`, { method: "DELETE" });
    },

    async bulkDelete(ids) {
      return postBulkDelete("/admin/payment-providers/bulk-delete", ids);
    },
  };
}

export { createApiPaymentProvidersService };
