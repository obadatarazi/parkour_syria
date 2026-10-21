import type { CategoriesService } from "@/features/categories/services/categories.service.types";
import type {
  Category,
  CategoryFormData,
  CategoryListParams,
} from "@/features/categories/types/categories.types";
import { mapCategoryFromApi } from "@/features/categories/utils/map-category-from-api";
import {
  apiRequest,
  appendBoolean,
  appendFile,
  appendNumberArray,
  appendTranslations,
  buildLaravelListParams,
  type LaravelPaginatedResponse,
  type LaravelSuccessResponse,
  mapPaginatedFromApi,
  postBulkDelete,
  submitMultipartFormData,
} from "@/shared/lib/api";

function buildCategoryFormData(data: Partial<CategoryFormData>): FormData {
  const formData = new FormData();
  if (data.translations) {
    appendTranslations(formData, data.translations);
  }
  if (data.publish !== undefined) {
    appendBoolean(formData, "publish", data.publish);
  }
  if (data.showMenu !== undefined) {
    appendBoolean(formData, "showMenu", data.showMenu);
  }
  if (data.showInHomePage !== undefined) {
    appendBoolean(formData, "showInHomePage", data.showInHomePage);
  }
  if (data.feature !== undefined) {
    appendBoolean(formData, "feature", data.feature);
  }
  if (data.parentCategoryIds !== undefined) {
    appendNumberArray(formData, "parent_category_ids", data.parentCategoryIds);
  }
  if (data.featureImage) {
    appendFile(formData, "feature_image", data.featureImage);
  }
  return formData;
}

function createApiCategoriesService(): CategoriesService {
  return {
    async list(params: CategoryListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<LaravelPaginatedResponse<Category>>("/admin/categories", {
        signal,
        params: buildLaravelListParams(
          {
            page: params.page,
            limit: params.limit,
            search: params.search,
            publish: params.publish,
            showMenu: params.showMenu,
            showInHomePage: params.showInHomePage,
            feature: params.feature,
            rootOnly: params.rootOnly,
            parentCategoryId: params.parentCategoryId,
            depth: params.depth,
            sort: params.sort,
            direction: params.direction,
          },
          { limit: 20 },
        ),
      });
      return mapPaginatedFromApi(response, mapCategoryFromApi);
    },

    async getById(id, signal?: AbortSignal) {
      const response = await apiRequest<LaravelSuccessResponse<Category>>(
        `/admin/categories/${id}`,
        { signal },
      );
      return mapCategoryFromApi(response.data);
    },

    async getBySlug(slug) {
      const response = await apiRequest<LaravelSuccessResponse<Category>>(`/categories/slug/${slug}`);
      return mapCategoryFromApi(response.data);
    },

    async create(data: CategoryFormData) {
      const response = await apiRequest<LaravelSuccessResponse<Category>>("/admin/categories", {
        method: "POST",
        body: buildCategoryFormData(data),
      });
      return mapCategoryFromApi(response.data);
    },

    async update(id, data: Partial<CategoryFormData>) {
      const formData = buildCategoryFormData(data);
      const { method, body } = submitMultipartFormData(formData, "PUT");
      const response = await apiRequest<LaravelSuccessResponse<Category>>(
        `/admin/categories/${id}`,
        {
          method,
          body,
        },
      );
      return mapCategoryFromApi(response.data);
    },

    async delete(id) {
      await apiRequest(`/admin/categories/${id}`, { method: "DELETE" });
    },

    async bulkDelete(ids) {
      return postBulkDelete("/admin/categories/bulk-delete", ids);
    },
  };
}

export { createApiCategoriesService };
