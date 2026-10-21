import type { Tag, TagFormData, TagListParams, TagListResult } from "@/features/tags/types/tags.types";
import type { BulkDeleteApiResult } from "@/shared/lib/api";

export interface TagsService {
  list(params?: TagListParams, signal?: AbortSignal): Promise<TagListResult>;
  getById(id: number, signal?: AbortSignal): Promise<Tag>;
  getBySlug(slug: string): Promise<Tag>;
  create(data: TagFormData): Promise<Tag>;
  update(id: number, data: Partial<TagFormData>): Promise<Tag>;
  delete(id: number): Promise<void>;
  bulkDelete(ids: Array<string | number>): Promise<BulkDeleteApiResult>;
}
