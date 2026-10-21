import type { StaticPromotionsService } from "@/features/static-promotions/services/static-promotions.service.types";
import type {
  StaticPromotion,
  StaticPromotionFormData,
  StaticPromotionListParams,
} from "@/features/static-promotions/types/static-promotions.types";
import { mapStaticPromotionFromApi } from "@/features/static-promotions/utils/map-static-promotion-from-api";
import type { LocaleImageUploadValue } from "@/shared/components/forms/LocaleImageUploadFields";
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
} from "@/shared/lib/api";

function appendImageTranslations(formData: FormData, translations: LocaleImageUploadValue): void {
  for (const [locale, translation] of Object.entries(translations)) {
    if (translation?.file instanceof File) {
      formData.append(`translations[${locale}][image]`, translation.file);
    }
  }
}

function buildStaticPromotionFormData(data: Partial<StaticPromotionFormData>): FormData {
  const formData = new FormData();
  if (data.translations) {
    appendImageTranslations(formData, data.translations);
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

function createApiStaticPromotionsService(): StaticPromotionsService {
  return {
    async list(params: StaticPromotionListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<LaravelPaginatedResponse<StaticPromotion>>(
        "/admin/static-promotions",
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
      return mapPaginatedFromApi(response, mapStaticPromotionFromApi);
    },

    async getById(id) {
      const response = await apiRequest<LaravelSuccessResponse<StaticPromotion>>(
        `/admin/static-promotions/${id}`,
      );
      return mapStaticPromotionFromApi(response.data);
    },

    async create(data: StaticPromotionFormData) {
      const response = await apiRequest<LaravelSuccessResponse<StaticPromotion>>(
        "/admin/static-promotions",
        {
          method: "POST",
          body: buildStaticPromotionFormData(data),
        },
      );
      return mapStaticPromotionFromApi(response.data);
    },

    async update(id, data: Partial<StaticPromotionFormData>) {
      const formData = buildStaticPromotionFormData(data);
      const { method, body } = submitMultipartFormData(formData, "PUT");
      const response = await apiRequest<LaravelSuccessResponse<StaticPromotion>>(
        `/admin/static-promotions/${id}`,
        { method, body },
      );
      return mapStaticPromotionFromApi(response.data);
    },

    async delete(id) {
      await apiRequest(`/admin/static-promotions/${id}`, { method: "DELETE" });
    },

    async bulkDelete(ids) {
      return postBulkDelete("/admin/static-promotions/bulk-delete", ids);
    },
  };
}

export { createApiStaticPromotionsService };
