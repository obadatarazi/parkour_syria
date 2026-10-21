import type { SlidersService } from "@/features/sliders/services/sliders.service.types";
import type { Slider, SliderFormData, SliderListParams } from "@/features/sliders/types/sliders.types";
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

const BASE_PATH = "/admin/sliders";

function buildSliderFormData(data: Partial<SliderFormData>, isUpdate: boolean): FormData {
  const formData = new FormData();
  const clearable = { allowEmpty: isUpdate };
  if (data.translations) appendLocaleFields(formData, data.translations, "title");
  appendOptional(formData, "sort_order", data.sortOrder);
  appendOptional(formData, "primary_page", data.primaryPage, clearable);
  appendOptional(formData, "secondary_page", data.secondaryPage, clearable);
  appendBoolean(formData, "publish", data.publish);
  appendFile(formData, "image", data.image);
  return formData;
}

const mapSlider = (slider: Slider): Slider => slider;

function createApiSlidersService(): SlidersService {
  return {
    async list(params: SliderListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<LaravelPaginatedResponse<Slider>>(BASE_PATH, {
        signal,
        params: buildLaravelListParams({ ...params }, { limit: 20 }),
      });
      return mapPaginatedFromApi(response, mapSlider);
    },

    async getById(id) {
      const response = await apiRequest<LaravelSuccessResponse<Slider>>(`${BASE_PATH}/${id}`);
      return response.data;
    },

    async create(data) {
      const response = await apiRequest<LaravelSuccessResponse<Slider>>(BASE_PATH, {
        method: "POST",
        body: buildSliderFormData(data, false),
      });
      return response.data;
    },

    async update(id, data) {
      const { method, body } = submitMultipartFormData(buildSliderFormData(data, true), "PUT");
      const response = await apiRequest<LaravelSuccessResponse<Slider>>(`${BASE_PATH}/${id}`, {
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

export { createApiSlidersService };
