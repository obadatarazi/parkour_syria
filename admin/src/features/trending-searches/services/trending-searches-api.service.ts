import type { TrendingSearchesService } from "@/features/trending-searches/services/trending-searches.service.types";
import type {
  TrendingSearch,
  TrendingSearchFormData,
  TrendingSearchListParams,
} from "@/features/trending-searches/types/trending-searches.types";
import { mapTrendingSearchFromApi } from "@/features/trending-searches/utils/map-trending-search-from-api";
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
  type TranslationsInput,
} from "@/shared/lib/api";

function appendLabelTranslations(formData: FormData, translations: TranslationsInput): void {
  for (const [locale, translation] of Object.entries(translations)) {
    if (!translation) continue;
    const label = translation.title?.trim() ?? "";
    if (!label) continue;
    formData.append(`translations[${locale}][label]`, label);
  }
}

function buildPayload(data: Partial<TrendingSearchFormData>): FormData {
  const formData = new FormData();

  if (data.translations) {
    appendLabelTranslations(formData, data.translations);
  }
  if (data.targetType !== undefined) {
    formData.append("target_type", data.targetType || "");
  }
  if (data.targetType === "KEYWORD") {
    // Service nulls target_id when type is KEYWORD; omit a numeric id.
  } else if (data.targetId !== undefined && data.targetId != null) {
    formData.append("target_id", String(data.targetId));
  }
  if (data.publish !== undefined) {
    appendBoolean(formData, "publish", data.publish);
  }
  if (data.sortOrder !== undefined) {
    appendOptional(formData, "sort_order", data.sortOrder);
  }

  return formData;
}

function createApiTrendingSearchesService(): TrendingSearchesService {
  return {
    async list(params: TrendingSearchListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<LaravelPaginatedResponse<TrendingSearch>>(
        "/admin/trending-searches",
        {
          signal,
          params: buildLaravelListParams(
            {
              page: params.page,
              limit: params.limit,
              search: params.search,
              publish: params.publish,
              targetType: params.targetType,
              sort: params.sort,
              direction: params.direction,
            },
            { limit: 20 },
          ),
        },
      );
      return mapPaginatedFromApi(response, mapTrendingSearchFromApi);
    },

    async getById(id, signal?: AbortSignal) {
      const response = await apiRequest<LaravelSuccessResponse<TrendingSearch>>(
        `/admin/trending-searches/${id}`,
        { signal },
      );
      return mapTrendingSearchFromApi(response.data);
    },

    async create(data: TrendingSearchFormData) {
      const response = await apiRequest<LaravelSuccessResponse<TrendingSearch>>(
        "/admin/trending-searches",
        {
          method: "POST",
          body: buildPayload(data),
        },
      );
      return mapTrendingSearchFromApi(response.data);
    },

    async update(id, data: Partial<TrendingSearchFormData>) {
      const formData = buildPayload(data);
      const { method, body } = submitMultipartFormData(formData, "PUT");
      const response = await apiRequest<LaravelSuccessResponse<TrendingSearch>>(
        `/admin/trending-searches/${id}`,
        { method, body },
      );
      return mapTrendingSearchFromApi(response.data);
    },

    async delete(id) {
      await apiRequest(`/admin/trending-searches/${id}`, { method: "DELETE" });
    },

    async bulkDelete(ids) {
      return postBulkDelete("/admin/trending-searches/bulk-delete", ids);
    },
  };
}

export { createApiTrendingSearchesService };
