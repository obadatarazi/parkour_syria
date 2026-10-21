import type {
  BlogPost,
  BlogPostFormData,
  BlogPostListParams,
  BlogPostListResult,
} from "@/features/blog-posts/types/blog-posts.types";
import type { BulkDeleteApiResult } from "@/shared/lib/api";

export interface BlogPostsService {
  list(params?: BlogPostListParams, signal?: AbortSignal): Promise<BlogPostListResult>;
  getById(id: number): Promise<BlogPost>;
  create(data: BlogPostFormData): Promise<BlogPost>;
  update(id: number, data: Partial<BlogPostFormData>): Promise<BlogPost>;
  delete(id: number): Promise<void>;
  bulkDelete(ids: Array<string | number>): Promise<BulkDeleteApiResult>;
}
