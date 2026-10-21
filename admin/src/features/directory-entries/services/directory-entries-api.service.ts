import type { DirectoryEntriesService } from "@/features/directory-entries/services/directory-entries.service.types";
import type {
  DirectoryEntry,
  DirectoryEntryFormData,
  DirectoryEntryListParams,
} from "@/features/directory-entries/types/directory-entries.types";
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

const BASE_PATH = "/admin/directory-entries";

function buildDirectoryEntryFormData(
  data: Partial<DirectoryEntryFormData>,
  isUpdate: boolean,
): FormData {
  const formData = new FormData();
  const clearable = { allowEmpty: isUpdate };
  if (data.translations) appendLocaleFields(formData, data.translations, "name");
  appendOptional(formData, "slug", data.slug);
  appendOptional(formData, "type", data.type);
  appendOptional(formData, "area_id", data.areaId, clearable);
  appendOptional(formData, "whatsapp", data.whatsapp, clearable);
  appendOptional(formData, "facebook_url", data.facebookUrl, clearable);
  appendOptional(formData, "instagram_url", data.instagramUrl, clearable);
  appendOptional(formData, "map_url", data.mapUrl, clearable);
  appendBoolean(formData, "verified", data.verified);
  appendBoolean(formData, "publish", data.publish);
  appendOptional(formData, "sort_order", data.sortOrder);
  appendFile(formData, "image", data.image);
  return formData;
}

const mapDirectoryEntry = (entry: DirectoryEntry): DirectoryEntry => entry;

function createApiDirectoryEntriesService(): DirectoryEntriesService {
  return {
    async list(params: DirectoryEntryListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<LaravelPaginatedResponse<DirectoryEntry>>(BASE_PATH, {
        signal,
        params: buildLaravelListParams({ ...params }, { limit: 20 }),
      });
      return mapPaginatedFromApi(response, mapDirectoryEntry);
    },

    async getById(id) {
      const response = await apiRequest<LaravelSuccessResponse<DirectoryEntry>>(`${BASE_PATH}/${id}`);
      return response.data;
    },

    async create(data) {
      const response = await apiRequest<LaravelSuccessResponse<DirectoryEntry>>(BASE_PATH, {
        method: "POST",
        body: buildDirectoryEntryFormData(data, false),
      });
      return response.data;
    },

    async update(id, data) {
      const { method, body } = submitMultipartFormData(buildDirectoryEntryFormData(data, true), "PUT");
      const response = await apiRequest<LaravelSuccessResponse<DirectoryEntry>>(`${BASE_PATH}/${id}`, {
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

export { createApiDirectoryEntriesService };
