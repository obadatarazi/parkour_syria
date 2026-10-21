import type { ContactUsService } from "@/features/contact-us/services/contact-us.service.types";
import type {
  ContactUsFormData,
  ContactUsListParams,
  ContactUsMessage,
} from "@/features/contact-us/types/contact-us.types";
import {
  apiRequest,
  buildLaravelListParams,
  type LaravelPaginatedResponse,
  type LaravelSuccessResponse,
  mapLaravelPagination,
  postBulkDelete,
} from "@/shared/lib/api";

function createApiContactUsService(): ContactUsService {
  return {
    async list(params: ContactUsListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<LaravelPaginatedResponse<ContactUsMessage>>(
        "/admin/contact-us",
        {
        signal,
          params: buildLaravelListParams(
            {
              page: params.page,
              limit: params.limit,
              search: params.search,
              status: params.status,
              sort: params.sort,
              direction: params.direction,
            },
            { limit: 20 },
          ),
        },
      );
      return mapLaravelPagination(response);
    },

    async getById(id) {
      const response = await apiRequest<LaravelSuccessResponse<ContactUsMessage>>(
        `/admin/contact-us/${id}`,
      );
      return response.data;
    },

    async update(id, data: Partial<ContactUsFormData>) {
      const response = await apiRequest<LaravelSuccessResponse<ContactUsMessage>>(
        `/admin/contact-us/${id}`,
        {
          method: "PUT",
          body: data,
        },
      );
      return response.data;
    },

    async delete(id) {
      await apiRequest(`/admin/contact-us/${id}`, { method: "DELETE" });
    },

    async bulkDelete(ids) {
      return postBulkDelete("/admin/contact-us/bulk-delete", ids);
    },
  };
}

export { createApiContactUsService };
