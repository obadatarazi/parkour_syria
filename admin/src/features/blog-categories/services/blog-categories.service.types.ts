import type {
  BlogCategory,
  BlogCategoryFormData,
  BlogCategoryListParams,
  BlogCategoryListResult,
} from "@/features/blog-categories/types/blog-categories.types";
import type { BulkDeleteApiResult } from "@/shared/lib/api";

export interface BlogCategoriesService {
  list(params?: BlogCategoryListParams, signal?: AbortSignal): Promise<BlogCategoryListResult>;
  getById(id: number): Promise<BlogCategory>;
  create(data: BlogCategoryFormData): Promise<BlogCategory>;
  update(id: number, data: Partial<BlogCategoryFormData>): Promise<BlogCategory>;
  delete(id: number): Promise<void>;
  bulkDelete(ids: Array<string | number>): Promise<BulkDeleteApiResult>;
}
