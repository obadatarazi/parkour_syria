import type { UsersService } from "@/features/users/services/users.service.types";
import type { AdminUser, UserFormData, UserListParams } from "@/features/users/types/users.types";
import {
  apiRequest,
  appendBoolean,
  appendFile,
  appendNumberArray,
  appendOptional,
  buildLaravelListParams,
  type LaravelPaginatedResponse,
  type LaravelSuccessResponse,
  mapLaravelPagination,
  postBulkDelete,
  submitMultipartFormData,
} from "@/shared/lib/api";

function buildUserFormData(
  data: Partial<UserFormData>,
  options: { isCreate: boolean; includeRoles?: boolean },
): FormData {
  const formData = new FormData();

  if (data.fullName !== undefined) {
    appendOptional(formData, "fullName", data.fullName);
  }
  if (data.email !== undefined) {
    appendOptional(formData, "email", data.email);
  }
  if (data.phoneNumber !== undefined) {
    appendOptional(formData, "phoneNumber", data.phoneNumber);
  }
  if (data.whatsappPhoneNumber !== undefined) {
    appendOptional(formData, "whatsappPhoneNumber", data.whatsappPhoneNumber, {
      allowEmpty: true,
    });
  }
  if (data.whatsappNotificationsEnabled !== undefined) {
    appendBoolean(formData, "whatsappNotificationsEnabled", data.whatsappNotificationsEnabled);
  }
  if (data.gender !== undefined) {
    appendOptional(formData, "gender", data.gender);
  }
  if (data.type !== undefined) {
    appendOptional(formData, "type", data.type);
  }
  if (data.dateOfBirth !== undefined) {
    appendOptional(formData, "dateOfBirth", data.dateOfBirth);
  }
  if (data.active !== undefined) {
    appendBoolean(formData, "active", data.active);
  }
  if (options.includeRoles && data.roles !== undefined) {
    appendNumberArray(formData, "roles", data.roles);
  }
  if (data.avatar) {
    appendFile(formData, "avatar", data.avatar);
  }

  if (options.isCreate || data.password) {
    appendOptional(formData, "password", data.password);
    appendOptional(formData, "passwordConfirmation", data.passwordConfirmation);
  }

  return formData;
}

function createApiUsersService(): UsersService {
  return {
    async list(params: UserListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<LaravelPaginatedResponse<AdminUser>>("/admin/users", {
        signal,
        params: buildLaravelListParams(
          {
            page: params.page,
            limit: params.limit,
            search: params.search,
            type: params.type,
            active: params.active,
          },
          { limit: 20 },
        ),
      });
      return mapLaravelPagination(response);
    },

    async getById(id, signal?: AbortSignal) {
      const response = await apiRequest<LaravelSuccessResponse<AdminUser>>(`/admin/users/${id}`, {
        signal,
      });
      return response.data;
    },

    async create(data: UserFormData) {
      const response = await apiRequest<LaravelSuccessResponse<AdminUser>>("/admin/users", {
        method: "POST",
        body: buildUserFormData(data, {
          isCreate: true,
          includeRoles: data.type === "ADMIN",
        }),
      });
      return response.data;
    },

    async update(id, data: Partial<UserFormData>) {
      const formData = buildUserFormData(data, {
        isCreate: false,
        includeRoles: data.roles !== undefined,
      });
      const { method, body } = submitMultipartFormData(formData, "PUT");
      const response = await apiRequest<LaravelSuccessResponse<AdminUser>>(`/admin/users/${id}`, {
        method,
        body,
      });
      return response.data;
    },

    async delete(id) {
      await apiRequest(`/admin/users/${id}`, { method: "DELETE" });
    },

    async bulkDelete(ids) {
      return postBulkDelete("/admin/users/bulk-delete", ids);
    },
  };
}

export { createApiUsersService };
