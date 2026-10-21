import type {
  AdminUser,
  UserFormData,
  UserListParams,
  UserListResult,
} from "@/features/users/types/users.types";
import type { BulkDeleteApiResult } from "@/shared/lib/api";

export interface UsersService {
  list(params?: UserListParams, signal?: AbortSignal): Promise<UserListResult>;
  getById(id: number, signal?: AbortSignal): Promise<AdminUser>;
  create(data: UserFormData): Promise<AdminUser>;
  update(id: number, data: Partial<UserFormData>): Promise<AdminUser>;
  delete(id: number): Promise<void>;
  bulkDelete(ids: Array<string | number>): Promise<BulkDeleteApiResult>;
}
