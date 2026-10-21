import type { CurrenciesService } from "@/features/currencies/services/currencies.service.types";
import type {
  Currency,
  CurrencyFormData,
  CurrencyListParams,
} from "@/features/currencies/types/currencies.types";
import {
  apiRequest,
  appendBoolean,
  appendOptional,
  appendTranslations,
  buildLaravelListParams,
  type LaravelPaginatedResponse,
  type LaravelSuccessResponse,
  mapPaginatedFromApi,
  mapTranslatableFromApi,
  postBulkDelete,
  submitMultipartFormData,
} from "@/shared/lib/api";

function buildCurrencyFormData(data: Partial<CurrencyFormData>): FormData {
  const formData = new FormData();
  if (data.translations) {
    appendTranslations(formData, data.translations);
  }
  appendOptional(formData, "symbol", data.symbol);
  appendOptional(formData, "code", data.code);
  if (data.publish !== undefined) {
    appendBoolean(formData, "publish", data.publish);
  }
  if (data.isDefault !== undefined) {
    appendBoolean(formData, "isDefault", data.isDefault);
  }
  return formData;
}

function createApiCurrenciesService(): CurrenciesService {
  return {
    async list(params: CurrencyListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<LaravelPaginatedResponse<Currency>>("/admin/currencies", {
        signal,
        params: buildLaravelListParams(
          {
            page: params.page,
            limit: params.limit,
            search: params.search,
            code: params.code,
            publish: params.publish,
            isDefault: params.isDefault,
            sort: params.sort,
            direction: params.direction,
          },
          { limit: 20 },
        ),
      });
      return mapPaginatedFromApi(response, mapTranslatableFromApi);
    },

    async getById(id) {
      const response = await apiRequest<LaravelSuccessResponse<Currency>>(
        `/admin/currencies/${id}`,
      );
      return mapTranslatableFromApi(response.data);
    },

    async create(data: CurrencyFormData) {
      const response = await apiRequest<LaravelSuccessResponse<Currency>>("/admin/currencies", {
        method: "POST",
        body: buildCurrencyFormData(data),
      });
      return mapTranslatableFromApi(response.data);
    },

    async update(id, data: Partial<CurrencyFormData>) {
      const formData = buildCurrencyFormData(data);
      const { method, body } = submitMultipartFormData(formData, "PUT");
      const response = await apiRequest<LaravelSuccessResponse<Currency>>(
        `/admin/currencies/${id}`,
        {
          method,
          body,
        },
      );
      return mapTranslatableFromApi(response.data);
    },

    async delete(id) {
      await apiRequest(`/admin/currencies/${id}`, { method: "DELETE" });
    },

    async bulkDelete(ids) {
      return postBulkDelete("/admin/currencies/bulk-delete", ids);
    },
  };
}

export { createApiCurrenciesService };
