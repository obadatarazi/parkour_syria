import type { StatesService } from "@/features/states/services/states.service.types";
import type { State, StateFormData, StateListParams } from "@/features/states/types/states.types";
import { mapStateFromApi } from "@/features/states/utils/map-state-from-api";
import {
  apiRequest,
  appendBoolean,
  appendOptional,
  appendTranslations,
  buildLaravelListParams,
  type LaravelPaginatedResponse,
  type LaravelSuccessResponse,
  mapPaginatedFromApi,
  postBulkDelete,
  submitMultipartFormData,
} from "@/shared/lib/api";

function buildStateFormData(data: Partial<StateFormData>): FormData {
  const formData = new FormData();
  if (data.translations) {
    appendTranslations(formData, data.translations);
  }
  if (data.publish !== undefined) {
    appendBoolean(formData, "publish", data.publish);
  }
  if (data.countryId !== undefined) {
    appendOptional(formData, "country_id", data.countryId);
  }
  return formData;
}

function createApiStatesService(): StatesService {
  return {
    async list(params: StateListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<LaravelPaginatedResponse<State>>("/admin/states", {
        signal,
        params: buildLaravelListParams(
          {
            page: params.page,
            limit: params.limit,
            search: params.search,
            publish: params.publish,
            countryId: params.countryId,
            sort: params.sort,
            direction: params.direction,
          },
          { limit: 20 },
        ),
      });
      return mapPaginatedFromApi(response, mapStateFromApi);
    },

    async getById(id) {
      const response = await apiRequest<LaravelSuccessResponse<State>>(`/admin/states/${id}`);
      return mapStateFromApi(response.data);
    },

    async create(data: StateFormData) {
      const response = await apiRequest<LaravelSuccessResponse<State>>("/admin/states", {
        method: "POST",
        body: buildStateFormData(data),
      });
      return mapStateFromApi(response.data);
    },

    async update(id, data: Partial<StateFormData>) {
      const formData = buildStateFormData(data);
      const { method, body } = submitMultipartFormData(formData, "PUT");
      const response = await apiRequest<LaravelSuccessResponse<State>>(`/admin/states/${id}`, {
        method,
        body,
      });
      return mapStateFromApi(response.data);
    },

    async delete(id) {
      await apiRequest(`/admin/states/${id}`, { method: "DELETE" });
    },

    async bulkDelete(ids) {
      return postBulkDelete("/admin/states/bulk-delete", ids);
    },
  };
}

export { createApiStatesService };
