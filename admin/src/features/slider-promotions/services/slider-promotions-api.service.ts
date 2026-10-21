import type { SliderPromotionsService } from "@/features/slider-promotions/services/slider-promotions.service.types";
import type {
  SliderPromotion,
  SliderPromotionFormData,
  SliderPromotionImageFormItem,
  SliderPromotionListParams,
} from "@/features/slider-promotions/types/slider-promotions.types";
import { mapSliderPromotionFromApi } from "@/features/slider-promotions/utils/map-slider-promotion-from-api";
import type { LocaleImageUploadValue } from "@/shared/components/forms/LocaleImageUploadFields";
import {
  apiRequest,
  appendBoolean,
  appendNumberArray,
  appendOptional,
  buildLaravelListParams,
  type LaravelPaginatedResponse,
  type LaravelSuccessResponse,
  mapPaginatedFromApi,
  postBulkDelete,
  submitMultipartFormData,
} from "@/shared/lib/api";

function appendImageItemTranslations(
  formData: FormData,
  prefix: string,
  translations: LocaleImageUploadValue,
): void {
  for (const [locale, translation] of Object.entries(translations)) {
    if (translation?.file instanceof File) {
      formData.append(`${prefix}[translations][${locale}][image]`, translation.file);
    }
    if (translation?.deleteImage) {
      formData.append(`${prefix}[translations][${locale}][delete_image]`, "1");
    }
  }
}

function appendSliderPromotionImages(
  formData: FormData,
  images: SliderPromotionImageFormItem[],
): void {
  images.forEach((image, index) => {
    const prefix = `images[${index}]`;
    if (image.id) {
      formData.append(`${prefix}[id]`, String(image.id));
    }
    appendImageItemTranslations(formData, prefix, image.translations);
  });
}

function buildSliderPromotionFormData(data: Partial<SliderPromotionFormData>): FormData {
  const formData = new FormData();
  if (data.images) {
    appendSliderPromotionImages(formData, data.images);
  }
  if (data.deletedImageIds?.length) {
    appendNumberArray(formData, "deleted_image_ids", data.deletedImageIds);
  }
  if (data.publish !== undefined) {
    appendBoolean(formData, "publish", data.publish);
  }
  appendOptional(formData, "link", data.link);
  if (data.position !== undefined) {
    appendOptional(formData, "position", data.position);
  }
  appendOptional(formData, "type", data.type);
  return formData;
}

function createApiSliderPromotionsService(): SliderPromotionsService {
  return {
    async list(params: SliderPromotionListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<LaravelPaginatedResponse<SliderPromotion>>(
        "/admin/slider-promotions",
        {
        signal,
          params: buildLaravelListParams(
            {
              page: params.page,
              limit: params.limit,
              publish: params.publish,
              type: params.type,
              position: params.position,
              sort: params.sort,
              direction: params.direction,
            },
            { limit: 10 },
          ),
        },
      );
      return mapPaginatedFromApi(response, mapSliderPromotionFromApi);
    },

    async getById(id) {
      const response = await apiRequest<LaravelSuccessResponse<SliderPromotion>>(
        `/admin/slider-promotions/${id}`,
      );
      return mapSliderPromotionFromApi(response.data);
    },

    async create(data: SliderPromotionFormData) {
      const response = await apiRequest<LaravelSuccessResponse<SliderPromotion>>(
        "/admin/slider-promotions",
        {
          method: "POST",
          body: buildSliderPromotionFormData(data),
        },
      );
      return mapSliderPromotionFromApi(response.data);
    },

    async update(id, data: Partial<SliderPromotionFormData>) {
      const formData = buildSliderPromotionFormData(data);
      const { method, body } = submitMultipartFormData(formData, "PUT");
      const response = await apiRequest<LaravelSuccessResponse<SliderPromotion>>(
        `/admin/slider-promotions/${id}`,
        { method, body },
      );
      return mapSliderPromotionFromApi(response.data);
    },

    async delete(id) {
      await apiRequest(`/admin/slider-promotions/${id}`, { method: "DELETE" });
    },

    async bulkDelete(ids) {
      return postBulkDelete("/admin/slider-promotions/bulk-delete", ids);
    },
  };
}

export { createApiSliderPromotionsService };
