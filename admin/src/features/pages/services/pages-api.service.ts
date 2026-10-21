import type { PagesService } from "@/features/pages/services/pages.service.types";
import type { PageFormData, PageListParams, SitePage } from "@/features/pages/types/pages.types";
import {
  apiRequest,
  appendBoolean,
  appendFile,
  buildLaravelListParams,
  type LaravelPaginatedResponse,
  type LaravelSuccessResponse,
  mapPaginatedFromApi,
  submitMultipartFormData,
} from "@/shared/lib/api";
import { appendLocaleFields } from "@/shared/lib/api/locale-fields.utils";

const BASE_PATH = "/admin/pages";

function buildPageFormData(data: Partial<PageFormData>): FormData {
  const formData = new FormData();
  if (data.translations) appendLocaleFields(formData, data.translations, "title");
  appendBoolean(formData, "publish", data.publish);
  appendFile(formData, "image", data.image);
  return formData;
}

const mapPage = (page: SitePage): SitePage => page;

function createApiPagesService(): PagesService {
  return {
    async list(params: PageListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<LaravelPaginatedResponse<SitePage>>(BASE_PATH, {
        signal,
        params: buildLaravelListParams({ ...params }, { limit: 50 }),
      });
      return mapPaginatedFromApi(response, mapPage);
    },

    async getById(id) {
      const response = await apiRequest<LaravelSuccessResponse<SitePage>>(`${BASE_PATH}/${id}`);
      return response.data;
    },

    async update(id, data) {
      const { method, body } = submitMultipartFormData(buildPageFormData(data), "PUT");
      const response = await apiRequest<LaravelSuccessResponse<SitePage>>(`${BASE_PATH}/${id}`, {
        method,
        body,
      });
      return response.data;
    },
  };
}

export { createApiPagesService };
