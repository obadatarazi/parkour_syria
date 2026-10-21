import type {
  DirectoryEntry,
  DirectoryEntryFormData,
  DirectoryEntryListParams,
  DirectoryEntryListResult,
} from "@/features/directory-entries/types/directory-entries.types";
import type { BulkDeleteApiResult } from "@/shared/lib/api";

export interface DirectoryEntriesService {
  list(params?: DirectoryEntryListParams, signal?: AbortSignal): Promise<DirectoryEntryListResult>;
  getById(id: number): Promise<DirectoryEntry>;
  create(data: DirectoryEntryFormData): Promise<DirectoryEntry>;
  update(id: number, data: Partial<DirectoryEntryFormData>): Promise<DirectoryEntry>;
  delete(id: number): Promise<void>;
  bulkDelete(ids: Array<string | number>): Promise<BulkDeleteApiResult>;
}
