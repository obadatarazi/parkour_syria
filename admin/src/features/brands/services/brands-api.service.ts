import type { BrandsService } from "@/features/brands/services/brands.service.types";
import type { Brand, BrandFormData, BrandListParams } from "@/features/brands/types/brands.types";
import { mapBrandFromApi } from "@/features/brands/utils/map-brand-from-api";
import {
  apiRequest,
  appendBoolean,
  appendFile,
  appendTranslations,
  buildLaravelListParams,
  type LaravelPaginatedResponse,
  type LaravelSuccessResponse,
  mapPaginatedFromApi,
  postBulkDelete,
  submitMultipartFormData,
} from "@/shared/lib/api";

function buildBrandFormData(data: Partial<BrandFormData>): FormData {
  const formData = new FormData();
  if (data.translations) {
    appendTranslations(formData, data.translations);
  }
  if (data.publish !== undefined) {
    appendBoolean(formData, "publish", data.publish);
  }
  if (data.logo) {
    appendFile(formData, "logo", data.logo);
  }
  return formData;
}

function createApiBrandsService(): BrandsService {
  return {
    async list(params: BrandListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<LaravelPaginatedResponse<Brand>>("/admin/brands", {
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
      return mapPaginatedFromApi(response, mapBrandFromApi);
    },

    async getById(id, signal?: AbortSignal) {
      const response = await apiRequest<LaravelSuccessResponse<Brand>>(`/admin/brands/${id}`, {
        signal,
      });
      return mapBrandFromApi(response.data);
    },

    async getBySlug(slug) {
      const response = await apiRequest<LaravelSuccessResponse<Brand>>(`/brands/slug/${slug}`);
      return mapBrandFromApi(response.data);
    },

    async create(data: BrandFormData) {
      const response = await apiRequest<LaravelSuccessResponse<Brand>>("/admin/brands", {
        method: "POST",
        body: buildBrandFormData(data),
      });
      return mapBrandFromApi(response.data);
    },

    async update(id, data: Partial<BrandFormData>) {
      const formData = buildBrandFormData(data);
      const { method, body } = submitMultipartFormData(formData, "PUT");
      const response = await apiRequest<LaravelSuccessResponse<Brand>>(`/admin/brands/${id}`, {
        method,
        body,
      });
      return mapBrandFromApi(response.data);
    },

    async delete(id) {
      await apiRequest(`/admin/brands/${id}`, { method: "DELETE" });
    },

    async bulkDelete(ids) {
      return postBulkDelete("/admin/brands/bulk-delete", ids);
    },
  };
}

export { createApiBrandsService };
