import type { SettingsService } from "@/features/settings/services/settings.service.types";
import type {
  MultiTypeSetting,
  MultiTypeSettingFormData,
  MultiTypeSettingListParams,
  MultiTypeSettingUpdateInput,
} from "@/features/settings/types/settings.types";
import {
  apiRequest,
  buildLaravelListParams,
  type LaravelPaginatedResponse,
  type LaravelSuccessResponse,
  mapLaravelPagination,
} from "@/shared/lib/api";

type EnumOptionValue = {
  label: string;
  value: string;
};

type ApiMultiTypeSetting = Omit<MultiTypeSetting, "type"> & {
  type: MultiTypeSetting["type"] | EnumOptionValue;
};

function normalizeTypeValue(type: ApiMultiTypeSetting["type"]): MultiTypeSetting["type"] {
  if (typeof type === "object" && type !== null && "value" in type) {
    return type.value as MultiTypeSetting["type"];
  }
  return type;
}

function normalizeSetting(setting: ApiMultiTypeSetting): MultiTypeSetting {
  return {
    ...setting,
    type: normalizeTypeValue(setting.type),
  };
}

function createApiSettingsService(): SettingsService {
  return {
    async list(params: MultiTypeSettingListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<LaravelPaginatedResponse<ApiMultiTypeSetting>>(
        "/admin/multi-type-settings",
        {
        signal,
          params: buildLaravelListParams(
            {
              page: params.page,
              limit: params.limit,
              search: params.search,
              type: params.type,
              sort: params.sort,
              direction: params.direction,
            },
            { limit: 50 },
          ),
        },
      );
      const paginated = mapLaravelPagination(response);
      return {
        ...paginated,
        data: paginated.data.map(normalizeSetting),
      };
    },

    async getById(id) {
      const response = await apiRequest<LaravelSuccessResponse<ApiMultiTypeSetting>>(
        `/admin/multi-type-settings/${id}`,
      );
      return normalizeSetting(response.data);
    },

    async create(data: MultiTypeSettingFormData) {
      const response = await apiRequest<LaravelSuccessResponse<ApiMultiTypeSetting>>(
        "/admin/multi-type-settings",
        {
          method: "POST",
          body: {
            setting_key: data.settingKey,
            value: data.value,
            type: data.type,
            description: data.description,
          },
        },
      );
      return normalizeSetting(response.data);
    },

    async update(id, input: MultiTypeSettingUpdateInput) {
      const response = await apiRequest<LaravelSuccessResponse<ApiMultiTypeSetting>>(
        `/admin/multi-type-settings/${id}`,
        {
          method: "PUT",
          body: input,
        },
      );
      return normalizeSetting(response.data);
    },

    async delete(id) {
      await apiRequest(`/admin/multi-type-settings/${id}`, { method: "DELETE" });
    },
  };
}

export { createApiSettingsService };
