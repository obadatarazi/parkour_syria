import type { BlogCategoriesService } from "@/features/blog-categories/services/blog-categories.service.types";
import type { BlogCategory, BlogCategoryFormData, BlogCategoryListParams } from "@/features/blog-categories/types/blog-categories.types";
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

const BASE_PATH = "/admin/blog-categories";

function buildBlogCategoryFormData(data: Partial<BlogCategoryFormData>): FormData {
  const formData = new FormData();
  if (data.translations) appendLocaleFields(formData, data.translations, "title");
  appendOptional(formData, "slug", data.slug);
  appendOptional(formData, "sort_order", data.sortOrder);
  appendBoolean(formData, "publish", data.publish);
  return formData;
}

const mapBlogCategory = (blogCategory: BlogCategory): BlogCategory => blogCategory;

function createApiBlogCategoriesService(): BlogCategoriesService {
  return {
    async list(params: BlogCategoryListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<LaravelPaginatedResponse<BlogCategory>>(BASE_PATH, {
        signal,
        params: buildLaravelListParams({ ...params }, { limit: 20 }),
      });
      return mapPaginatedFromApi(response, mapBlogCategory);
    },

    async getById(id) {
      const response = await apiRequest<LaravelSuccessResponse<BlogCategory>>(`${BASE_PATH}/${id}`);
      return response.data;
    },

    async create(data) {
      const response = await apiRequest<LaravelSuccessResponse<BlogCategory>>(BASE_PATH, {
        method: "POST",
        body: buildBlogCategoryFormData(data),
      });
      return response.data;
    },

    async update(id, data) {
      const { method, body } = submitMultipartFormData(buildBlogCategoryFormData(data), "PUT");
      const response = await apiRequest<LaravelSuccessResponse<BlogCategory>>(`${BASE_PATH}/${id}`, {
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

export { createApiBlogCategoriesService };
