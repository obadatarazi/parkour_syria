import type {
  Category,
  CategoryFormData,
  CategoryListParams,
  CategoryListResult,
} from "@/features/categories/types/categories.types";
import type { BulkDeleteApiResult } from "@/shared/lib/api";

export interface CategoriesService {
  list(params?: CategoryListParams, signal?: AbortSignal): Promise<CategoryListResult>;
  getById(id: number, signal?: AbortSignal): Promise<Category>;
  getBySlug(slug: string): Promise<Category>;
  create(data: CategoryFormData): Promise<Category>;
  update(id: number, data: Partial<CategoryFormData>): Promise<Category>;
  delete(id: number): Promise<void>;
  bulkDelete(ids: Array<string | number>): Promise<BulkDeleteApiResult>;
}
