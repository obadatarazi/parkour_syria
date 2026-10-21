import type { AttributesService } from "@/features/attributes/services/attributes.service.types";
import type {
  Attribute,
  AttributeFormData,
  AttributeListParams,
} from "@/features/attributes/types/attributes.types";
import { mapAttributeFromApi } from "@/features/attributes/utils/map-attribute-from-api";
import {
  apiRequest,
  appendBoolean,
  appendTranslations,
  buildLaravelListParams,
  type LaravelPaginatedResponse,
  type LaravelSuccessResponse,
  mapPaginatedFromApi,
  postBulkDelete,
  submitMultipartFormData,
} from "@/shared/lib/api";

function buildAttributeFormData(data: Partial<AttributeFormData>): FormData {
  const formData = new FormData();
  if (data.translations) {
    appendTranslations(formData, data.translations);
  }
  if (data.publish !== undefined) {
    appendBoolean(formData, "publish", data.publish);
  }
  return formData;
}

function createApiAttributesService(): AttributesService {
  return {
    async list(params: AttributeListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<LaravelPaginatedResponse<Attribute>>("/admin/attributes", {
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
      return mapPaginatedFromApi(response, mapAttributeFromApi);
    },

    async getById(id) {
      const response = await apiRequest<LaravelSuccessResponse<Attribute>>(`/admin/attributes/${id}`);
      return mapAttributeFromApi(response.data);
    },

    async create(data: AttributeFormData) {
      const response = await apiRequest<LaravelSuccessResponse<Attribute>>("/admin/attributes", {
        method: "POST",
        body: buildAttributeFormData(data),
      });
      return mapAttributeFromApi(response.data);
    },

    async update(id, data: Partial<AttributeFormData>) {
      const formData = buildAttributeFormData(data);
      const { method, body } = submitMultipartFormData(formData, "PUT");
      const response = await apiRequest<LaravelSuccessResponse<Attribute>>(`/admin/attributes/${id}`, {
        method,
        body,
      });
      return mapAttributeFromApi(response.data);
    },

    async delete(id) {
      await apiRequest(`/admin/attributes/${id}`, { method: "DELETE" });
    },

    async bulkDelete(ids) {
      return postBulkDelete("/admin/attributes/bulk-delete", ids);
    },
  };
}

export { createApiAttributesService };
