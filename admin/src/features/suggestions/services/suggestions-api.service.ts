import type { SuggestionsService } from "@/features/suggestions/services/suggestions.service.types";
import {
  type Suggestion,
  suggestionAcceptToApi,
  suggestionFormToApi,
  type SuggestionListParams,
} from "@/features/suggestions/types/suggestions.types";
import {
  apiRequest,
  buildLaravelListParams,
  type LaravelPaginatedResponse,
  type LaravelSuccessResponse,
  mapPaginatedFromApi,
  postBulkDelete,
} from "@/shared/lib/api";

const BASE_PATH = "/admin/suggestions";

const mapSuggestion = (suggestion: Suggestion): Suggestion => suggestion;

function createApiSuggestionsService(): SuggestionsService {
  return {
    async list(params: SuggestionListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<LaravelPaginatedResponse<Suggestion>>(BASE_PATH, {
        signal,
        params: buildLaravelListParams({ ...params }, { limit: 20 }),
      });
      return mapPaginatedFromApi(response, mapSuggestion);
    },

    async getById(id) {
      const response = await apiRequest<LaravelSuccessResponse<Suggestion>>(`${BASE_PATH}/${id}`);
      return response.data;
    },

    async update(id, data) {
      const response = await apiRequest<LaravelSuccessResponse<Suggestion>>(`${BASE_PATH}/${id}`, {
        method: "PUT",
        body: suggestionFormToApi(data),
      });
      return response.data;
    },

    async accept(id, data) {
      const response = await apiRequest<LaravelSuccessResponse<Suggestion>>(
        `${BASE_PATH}/${id}/accept`,
        { method: "POST", body: suggestionAcceptToApi(data) },
      );
      return response.data;
    },

    async reject(id, reason) {
      const response = await apiRequest<LaravelSuccessResponse<Suggestion>>(
        `${BASE_PATH}/${id}/reject`,
        { method: "POST", body: { reject_reason: reason } },
      );
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

export { createApiSuggestionsService };
