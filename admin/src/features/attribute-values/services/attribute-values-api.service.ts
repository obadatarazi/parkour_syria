import type { AttributeValuesService } from "@/features/attribute-values/services/attribute-values.service.types";
import type {
  AttributeValue,
  AttributeValueFormData,
  AttributeValueListParams,
} from "@/features/attribute-values/types/attribute-values.types";
import {
  apiRequest,
  appendBoolean,
  appendTranslations,
  buildLaravelListParams,
  type LaravelPaginatedResponse,
  type LaravelSuccessResponse,
  mapPaginatedFromApi,
  mapTranslatableFromApi,
  postBulkDelete,
  submitMultipartFormData,
} from "@/shared/lib/api";

function mapAttributeValueFromApi(value: AttributeValue): AttributeValue {
  return {
    ...mapTranslatableFromApi(value),
    attribute: value.attribute ? mapTranslatableFromApi(value.attribute) : value.attribute,
  };
}

function buildAttributeValueFormData(data: Partial<AttributeValueFormData>): FormData {
  const formData = new FormData();
  if (data.attributeId != null) {
    formData.append("attribute_id", String(data.attributeId));
  }
  if (data.translations) {
    appendTranslations(formData, data.translations);
  }
  if (data.publish !== undefined) {
    appendBoolean(formData, "publish", data.publish);
  }
  return formData;
}

function createApiAttributeValuesService(): AttributeValuesService {
  return {
    async list(params: AttributeValueListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<LaravelPaginatedResponse<AttributeValue>>(
        "/admin/attribute-values",
        {
        signal,
          params: buildLaravelListParams(
            {
              page: params.page,
              limit: params.limit,
              search: params.search,
              publish: params.publish,
              attributeId: params.attributeId,
              sort: params.sort,
              direction: params.direction,
            },
            { limit: 20 },
          ),
        },
      );
      return mapPaginatedFromApi(response, mapAttributeValueFromApi);
    },

    async getById(id) {
      const response = await apiRequest<LaravelSuccessResponse<AttributeValue>>(
        `/admin/attribute-values/${id}`,
      );
      return mapAttributeValueFromApi(response.data);
    },

    async create(data: AttributeValueFormData) {
      const response = await apiRequest<LaravelSuccessResponse<AttributeValue>>(
        "/admin/attribute-values",
        {
          method: "POST",
          body: buildAttributeValueFormData(data),
        },
      );
      return mapAttributeValueFromApi(response.data);
    },

    async update(id, data: Partial<AttributeValueFormData>) {
      const formData = buildAttributeValueFormData(data);
      const { method, body } = submitMultipartFormData(formData, "PUT");
      const response = await apiRequest<LaravelSuccessResponse<AttributeValue>>(
        `/admin/attribute-values/${id}`,
        {
          method,
          body,
        },
      );
      return mapAttributeValueFromApi(response.data);
    },

    async delete(id) {
      await apiRequest(`/admin/attribute-values/${id}`, { method: "DELETE" });
    },

    async bulkDelete(ids) {
      return postBulkDelete("/admin/attribute-values/bulk-delete", ids);
    },
  };
}

export { createApiAttributeValuesService };
