import type { EventsService } from "@/features/events/services/events.service.types";
import {
  type EventFormData,
  type EventListParams,
  inputDateTimeToApi,
  type ParkourEvent,
} from "@/features/events/types/events.types";
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

const BASE_PATH = "/admin/events";

function buildEventFormData(data: Partial<EventFormData>, isUpdate: boolean): FormData {
  const formData = new FormData();
  const clearable = { allowEmpty: isUpdate };
  if (data.translations) appendLocaleFields(formData, data.translations, "title");
  appendOptional(formData, "slug", data.slug);
  appendOptional(formData, "type", data.type);
  if (data.startsAt) appendOptional(formData, "starts_at", inputDateTimeToApi(data.startsAt));
  appendOptional(formData, "area_id", data.areaId, clearable);
  appendOptional(formData, "contact", data.contact, clearable);
  appendBoolean(formData, "publish", data.publish);
  appendFile(formData, "image", data.image);
  return formData;
}

const mapEvent = (event: ParkourEvent): ParkourEvent => event;

function createApiEventsService(): EventsService {
  return {
    async list(params: EventListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<LaravelPaginatedResponse<ParkourEvent>>(BASE_PATH, {
        signal,
        params: buildLaravelListParams({ ...params }, { limit: 20 }),
      });
      return mapPaginatedFromApi(response, mapEvent);
    },

    async getById(id) {
      const response = await apiRequest<LaravelSuccessResponse<ParkourEvent>>(`${BASE_PATH}/${id}`);
      return response.data;
    },

    async create(data) {
      const response = await apiRequest<LaravelSuccessResponse<ParkourEvent>>(BASE_PATH, {
        method: "POST",
        body: buildEventFormData(data, false),
      });
      return response.data;
    },

    async update(id, data) {
      const { method, body } = submitMultipartFormData(buildEventFormData(data, true), "PUT");
      const response = await apiRequest<LaravelSuccessResponse<ParkourEvent>>(`${BASE_PATH}/${id}`, {
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

export { createApiEventsService };
