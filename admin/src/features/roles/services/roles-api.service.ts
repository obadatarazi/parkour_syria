import type { RolesService } from "@/features/roles/services/roles.service.types";
import type {
  PermissionSection,
  Role,
  RoleFormData,
  RoleListParams,
} from "@/features/roles/types/roles.types";
import {
  apiRequest,
  buildLaravelListParams,
  type LaravelPaginatedResponse,
  type LaravelSuccessResponse,
  mapLaravelPagination,
  postBulkDelete,
} from "@/shared/lib/api";

function createApiRolesService(): RolesService {
  async function listPermissions(
    params: Parameters<RolesService["listPermissions"]>[0] = {},
    signal?: AbortSignal,
  ) {
    const response = await apiRequest<LaravelPaginatedResponse<{ id: number; name: string }>>(
      "/admin/permissions",
      {
        signal,
        params: buildLaravelListParams(
          {
            page: params.page,
            limit: params.limit,
            search: params.search,
            sort: params.sort,
            direction: params.direction,
          },
          { limit: 200 },
        ),
      },
    );
    return mapLaravelPagination(response);
  }

  async function listAllPermissions(
    options: Parameters<RolesService["listAllPermissions"]>[0] = {},
  ) {
    const pageSize = options.pageSize ?? 200;
    const sort = options.sort ?? "name";
    const direction = options.direction ?? "asc";
    const signal = options.signal;

    const merged: { id: number; name: string }[] = [];
    const seenIds = new Set<number>();
    let total = 0;

    const firstPage = await listPermissions(
      { page: 1, limit: pageSize, sort, direction },
      signal,
    );
    total = firstPage.total;

    for (const permission of firstPage.data) {
      if (seenIds.has(permission.id)) continue;
      seenIds.add(permission.id);
      merged.push(permission);
    }

    if (total === 0) {
      return { data: [], total: 0, page: 1, pageSize };
    }

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    for (let page = 2; page <= totalPages; page += 1) {
      if (signal?.aborted) {
        throw new DOMException("Permissions fetch aborted", "AbortError");
      }

      const nextPage = await listPermissions(
        { page, limit: pageSize, sort, direction },
        signal,
      );

      if (nextPage.data.length === 0 && merged.length < total) {
        throw new Error(
          `Incomplete permissions list: expected ${total}, loaded ${merged.length} (empty page ${page}).`,
        );
      }

      for (const permission of nextPage.data) {
        if (seenIds.has(permission.id)) continue;
        seenIds.add(permission.id);
        merged.push(permission);
      }
    }

    if (merged.length < total) {
      throw new Error(
        `Incomplete permissions list: expected ${total}, loaded ${merged.length}.`,
      );
    }

    return {
      data: merged,
      total,
      page: 1,
      pageSize: merged.length,
    };
  }

  return {
    async list(params: RoleListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<LaravelPaginatedResponse<Role>>("/admin/roles", {
        signal,
        params: buildLaravelListParams(
          {
            page: params.page,
            limit: params.limit,
            search: params.search,
            sort: params.sort,
            direction: params.direction,
            code: params.code,
          },
          { limit: 20 },
        ),
      });
      return mapLaravelPagination(response);
    },

    async getById(id, signal?: AbortSignal) {
      const response = await apiRequest<LaravelSuccessResponse<Role>>(`/admin/roles/${id}`, {
        signal,
      });
      return response.data;
    },

    async create(data: RoleFormData) {
      const response = await apiRequest<LaravelSuccessResponse<Role>>("/admin/roles", {
        method: "POST",
        body: {
          name: data.name,
          standard: data.standard ?? false,
          permissions: data.permissions,
        },
      });
      return response.data;
    },

    async update(id, data: Partial<RoleFormData>) {
      const response = await apiRequest<LaravelSuccessResponse<Role>>(`/admin/roles/${id}`, {
        method: "PUT",
        body: data,
      });
      return response.data;
    },

    async delete(id) {
      await apiRequest(`/admin/roles/${id}`, { method: "DELETE" });
    },

    async bulkDelete(ids) {
      return postBulkDelete("/admin/roles/bulk-delete", ids);
    },

    async getPermissionsBySection() {
      const response = await apiRequest<LaravelSuccessResponse<PermissionSection[]>>(
        "/admin/role/by-section",
      );
      return response.data;
    },

    listPermissions,
    listAllPermissions,
  };
}

export { createApiRolesService };
