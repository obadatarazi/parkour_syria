import type { VisualSettingsService } from "@/features/visual-settings/services/visual-settings.service.types";
import type {
  VisualSetting,
  VisualSettingFormData,
  VisualSettingListParams,
} from "@/features/visual-settings/types/visual-settings.types";
import { mapVisualSettingFromApi } from "@/features/visual-settings/utils/map-visual-setting-from-api";
import {
  apiRequest,
  appendFile,
  appendOptional,
  appendTranslations,
  buildLaravelListParams,
  type LaravelPaginatedResponse,
  type LaravelSuccessResponse,
  mapPaginatedFromApi,
  submitMultipartFormData,
} from "@/shared/lib/api";

function buildVisualSettingFormData(data: Partial<VisualSettingFormData>): FormData {
  const formData = new FormData();
  if (data.translations) {
    appendTranslations(formData, data.translations);
  }
  if (data.image) {
    appendFile(formData, "image", data.image);
  }
  appendOptional(formData, "link", data.link);
  return formData;
}

function createApiVisualSettingsService(): VisualSettingsService {
  return {
    async list(params: VisualSettingListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<LaravelPaginatedResponse<VisualSetting>>(
        "/admin/visual-settings",
        {
        signal,
          params: buildLaravelListParams(
            {
              page: params.page,
              limit: params.limit,
              search: params.search,
              sort: params.sort,
              direction: params.direction,
            },
            { limit: 20 },
          ),
        },
      );
      return mapPaginatedFromApi(response, mapVisualSettingFromApi);
    },

    async getById(id) {
      const response = await apiRequest<LaravelSuccessResponse<VisualSetting>>(
        `/admin/visual-settings/${id}`,
      );
      return mapVisualSettingFromApi(response.data);
    },

    async update(id, data: Partial<VisualSettingFormData>) {
      const formData = buildVisualSettingFormData(data);
      const { method, body } = submitMultipartFormData(formData, "PUT");
      const response = await apiRequest<LaravelSuccessResponse<VisualSetting>>(
        `/admin/visual-settings/${id}`,
        {
          method,
          body,
        },
      );
      return mapVisualSettingFromApi(response.data);
    },
  };
}

export { createApiVisualSettingsService };
