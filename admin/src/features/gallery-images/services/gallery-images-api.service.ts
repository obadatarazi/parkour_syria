import type { GalleryImagesService } from "@/features/gallery-images/services/gallery-images.service.types";
import type { GalleryImage, GalleryImageFormData, GalleryImageListParams } from "@/features/gallery-images/types/gallery-images.types";
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

const BASE_PATH = "/admin/gallery-images";

function buildGalleryImageFormData(data: Partial<GalleryImageFormData>): FormData {
  const formData = new FormData();
  if (data.translations) appendLocaleFields(formData, data.translations, "caption");
  appendOptional(formData, "sort_order", data.sortOrder);
  appendBoolean(formData, "publish", data.publish);
  appendFile(formData, "image", data.image);
  return formData;
}

const mapGalleryImage = (galleryImage: GalleryImage): GalleryImage => galleryImage;

function createApiGalleryImagesService(): GalleryImagesService {
  return {
    async list(params: GalleryImageListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<LaravelPaginatedResponse<GalleryImage>>(BASE_PATH, {
        signal,
        params: buildLaravelListParams({ ...params }, { limit: 20 }),
      });
      return mapPaginatedFromApi(response, mapGalleryImage);
    },

    async getById(id) {
      const response = await apiRequest<LaravelSuccessResponse<GalleryImage>>(`${BASE_PATH}/${id}`);
      return response.data;
    },

    async create(data) {
      const response = await apiRequest<LaravelSuccessResponse<GalleryImage>>(BASE_PATH, {
        method: "POST",
        body: buildGalleryImageFormData(data),
      });
      return response.data;
    },

    async update(id, data) {
      const { method, body } = submitMultipartFormData(buildGalleryImageFormData(data), "PUT");
      const response = await apiRequest<LaravelSuccessResponse<GalleryImage>>(`${BASE_PATH}/${id}`, {
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

export { createApiGalleryImagesService };
