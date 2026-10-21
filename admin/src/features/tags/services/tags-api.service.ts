import type { TagsService } from "@/features/tags/services/tags.service.types";
import type { Tag, TagFormData, TagListParams } from "@/features/tags/types/tags.types";
import { mapTagFromApi } from "@/features/tags/utils/map-tag-from-api";
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

function buildTagFormData(data: Partial<TagFormData>): FormData {
  const formData = new FormData();
  if (data.translations) {
    appendTranslations(formData, data.translations);
  }
  if (data.publish !== undefined) {
    appendBoolean(formData, "publish", data.publish);
  }
  return formData;
}

function createApiTagsService(): TagsService {
  return {
    async list(params: TagListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<LaravelPaginatedResponse<Tag>>("/admin/tags", {
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
      return mapPaginatedFromApi(response, mapTagFromApi);
    },

    async getById(id, signal?: AbortSignal) {
      const response = await apiRequest<LaravelSuccessResponse<Tag>>(`/admin/tags/${id}`, {
        signal,
      });
      return mapTagFromApi(response.data);
    },

    async getBySlug(slug) {
      const response = await apiRequest<LaravelSuccessResponse<Tag>>(`/tags/slug/${slug}`);
      return mapTagFromApi(response.data);
    },

    async create(data: TagFormData) {
      const response = await apiRequest<LaravelSuccessResponse<Tag>>("/admin/tags", {
        method: "POST",
        body: buildTagFormData(data),
      });
      return mapTagFromApi(response.data);
    },

    async update(id, data: Partial<TagFormData>) {
      const formData = buildTagFormData(data);
      const { method, body } = submitMultipartFormData(formData, "PUT");
      const response = await apiRequest<LaravelSuccessResponse<Tag>>(`/admin/tags/${id}`, {
        method,
        body,
      });
      return mapTagFromApi(response.data);
    },

    async delete(id) {
      await apiRequest(`/admin/tags/${id}`, { method: "DELETE" });
    },

    async bulkDelete(ids) {
      return postBulkDelete("/admin/tags/bulk-delete", ids);
    },
  };
}

export { createApiTagsService };
