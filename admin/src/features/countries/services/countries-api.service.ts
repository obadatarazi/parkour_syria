import type { CountriesService } from "@/features/countries/services/countries.service.types";
import type {
  Country,
  CountryFormData,
  CountryListParams,
} from "@/features/countries/types/countries.types";
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

function buildCountryFormData(data: Partial<CountryFormData>): FormData {
  const formData = new FormData();
  if (data.translations) {
    appendTranslations(formData, data.translations);
  }
  appendOptional(formData, "countryIso", data.countryIso);
  if (data.publish !== undefined) {
    appendBoolean(formData, "publish", data.publish);
  }
  return formData;
}

function createApiCountriesService(): CountriesService {
  return {
    async list(params: CountryListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<LaravelPaginatedResponse<Country>>("/admin/countries", {
        signal,
        params: buildLaravelListParams(
          {
            page: params.page,
            limit: params.limit,
            search: params.search,
            publish: params.publish,
            sort: params.sort,
            direction: params.direction,
          },
          { limit: 20 },
        ),
      });
      return mapPaginatedFromApi(response, mapTranslatableFromApi);
    },

    async getById(id) {
      const response = await apiRequest<LaravelSuccessResponse<Country>>(`/admin/countries/${id}`);
      return mapTranslatableFromApi(response.data);
    },

    async create(data: CountryFormData) {
      const response = await apiRequest<LaravelSuccessResponse<Country>>("/admin/countries", {
        method: "POST",
        body: buildCountryFormData(data),
      });
      return mapTranslatableFromApi(response.data);
    },

    async update(id, data: Partial<CountryFormData>) {
      const formData = buildCountryFormData(data);
      const { method, body } = submitMultipartFormData(formData, "PUT");
      const response = await apiRequest<LaravelSuccessResponse<Country>>(`/admin/countries/${id}`, {
        method,
        body,
      });
      return mapTranslatableFromApi(response.data);
    },

    async delete(id) {
      await apiRequest(`/admin/countries/${id}`, { method: "DELETE" });
    },

    async bulkDelete(ids) {
      return postBulkDelete("/admin/countries/bulk-delete", ids);
    },
  };
}

export { createApiCountriesService };
