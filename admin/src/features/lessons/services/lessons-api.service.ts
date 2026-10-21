import type { LessonsService } from "@/features/lessons/services/lessons.service.types";
import type { Lesson, LessonFormData, LessonListParams } from "@/features/lessons/types/lessons.types";
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

const BASE_PATH = "/admin/lessons";

function buildLessonFormData(data: Partial<LessonFormData>, isUpdate: boolean): FormData {
  const formData = new FormData();
  if (data.translations) appendLocaleFields(formData, data.translations, "title");
  appendOptional(formData, "slug", data.slug);
  appendOptional(formData, "sort_order", data.sortOrder);
  appendOptional(formData, "youtube_url", data.youtubeUrl, { allowEmpty: isUpdate });
  appendBoolean(formData, "publish", data.publish);
  appendFile(formData, "image", data.image);
  return formData;
}

const mapLesson = (lesson: Lesson): Lesson => lesson;

function createApiLessonsService(): LessonsService {
  return {
    async list(params: LessonListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<LaravelPaginatedResponse<Lesson>>(BASE_PATH, {
        signal,
        params: buildLaravelListParams({ ...params }, { limit: 20 }),
      });
      return mapPaginatedFromApi(response, mapLesson);
    },

    async getById(id) {
      const response = await apiRequest<LaravelSuccessResponse<Lesson>>(`${BASE_PATH}/${id}`);
      return response.data;
    },

    async create(data) {
      const response = await apiRequest<LaravelSuccessResponse<Lesson>>(BASE_PATH, {
        method: "POST",
        body: buildLessonFormData(data, false),
      });
      return response.data;
    },

    async update(id, data) {
      const { method, body } = submitMultipartFormData(buildLessonFormData(data, true), "PUT");
      const response = await apiRequest<LaravelSuccessResponse<Lesson>>(`${BASE_PATH}/${id}`, {
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

export { createApiLessonsService };
