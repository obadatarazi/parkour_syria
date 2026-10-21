import type { BlogPostsService } from "@/features/blog-posts/services/blog-posts.service.types";
import type {
  BlogPost,
  BlogPostFormData,
  BlogPostListParams,
} from "@/features/blog-posts/types/blog-posts.types";
import { inputDateTimeToApi } from "@/features/events/types/events.types";
import {
  apiRequest,
  appendBoolean,
  appendFile,
  appendOptional,
  buildLaravelListParams,
  type LaravelPaginatedResponse,
  type LaravelSuccessResponse,
  mapPaginatedFromApi,
  postBulkDelete,
  submitMultipartFormData,
} from "@/shared/lib/api";
import { appendLocaleFields } from "@/shared/lib/api/locale-fields.utils";

const BASE_PATH = "/admin/blog-posts";

function buildBlogPostFormData(data: Partial<BlogPostFormData>, isUpdate: boolean): FormData {
  const formData = new FormData();
  const clearable = { allowEmpty: isUpdate };
  if (data.translations) appendLocaleFields(formData, data.translations, "title");
  appendOptional(formData, "slug", data.slug);
  appendOptional(formData, "blog_category_id", data.blogCategoryId, clearable);
  if (data.publishedAt !== undefined) {
    appendOptional(formData, "published_at", inputDateTimeToApi(data.publishedAt), clearable);
  }
  appendBoolean(formData, "publish", data.publish);
  appendFile(formData, "image", data.image);
  return formData;
}

const mapBlogPost = (post: BlogPost): BlogPost => post;

function createApiBlogPostsService(): BlogPostsService {
  return {
    async list(params: BlogPostListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<LaravelPaginatedResponse<BlogPost>>(BASE_PATH, {
        signal,
        params: buildLaravelListParams({ ...params }, { limit: 20 }),
      });
      return mapPaginatedFromApi(response, mapBlogPost);
    },

    async getById(id) {
      const response = await apiRequest<LaravelSuccessResponse<BlogPost>>(`${BASE_PATH}/${id}`);
      return response.data;
    },

    async create(data) {
      const response = await apiRequest<LaravelSuccessResponse<BlogPost>>(BASE_PATH, {
        method: "POST",
        body: buildBlogPostFormData(data, false),
      });
      return response.data;
    },

    async update(id, data) {
      const { method, body } = submitMultipartFormData(buildBlogPostFormData(data, true), "PUT");
      const response = await apiRequest<LaravelSuccessResponse<BlogPost>>(`${BASE_PATH}/${id}`, {
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

export { createApiBlogPostsService };
