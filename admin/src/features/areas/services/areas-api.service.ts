import type { AreasService } from "@/features/areas/services/areas.service.types";
import type { Area, AreaFormData, AreaListParams } from "@/features/areas/types/areas.types";
import {
  apiRequest,
  appendBoolean,
  appendOptional,
  buildLaravelListParams,
  type LaravelPaginatedResponse,
  type LaravelSuccessResponse,
  mapPaginatedFromApi,
  postBulkDelete,
  submitMultipartFormData,
} from "@/shared/lib/api";
import { appendLocaleFields } from "@/shared/lib/api/locale-fields.utils";

const BASE_PATH = "/admin/areas";

function buildAreaFormData(data: Partial<AreaFormData>): FormData {
  const formData = new FormData();
  if (data.translations) appendLocaleFields(formData, data.translations, "name");
  appendOptional(formData, "slug", data.slug);
  appendOptional(formData, "sort_order", data.sortOrder);
  appendBoolean(formData, "publish", data.publish);
  return formData;
}

const mapArea = (area: Area): Area => area;

function createApiAreasService(): AreasService {
  return {
    async list(params: AreaListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<LaravelPaginatedResponse<Area>>(BASE_PATH, {
        signal,
        params: buildLaravelListParams({ ...params }, { limit: 20 }),
      });
      return mapPaginatedFromApi(response, mapArea);
    },

    async getById(id) {
      const response = await apiRequest<LaravelSuccessResponse<Area>>(`${BASE_PATH}/${id}`);
      return response.data;
    },

    async create(data) {
      const response = await apiRequest<LaravelSuccessResponse<Area>>(BASE_PATH, {
        method: "POST",
        body: buildAreaFormData(data),
      });
      return response.data;
    },

    async update(id, data) {
      const { method, body } = submitMultipartFormData(buildAreaFormData(data), "PUT");
      const response = await apiRequest<LaravelSuccessResponse<Area>>(`${BASE_PATH}/${id}`, {
        method,
        body,
      });
      return response.data;
    },

    async delete(id) {
      await apiRequest(`${BASE_PATH}/${id}`, { method: "DELETE" });
    },

    async bulkDelete(ids) {
      return postBulkDelete(`${BASE_PATH}/bulk-delete`, ids);
    },
  };
}

export { createApiAreasService };
