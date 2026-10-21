import type {
  Suggestion,
  SuggestionAcceptData,
  SuggestionFormData,
  SuggestionListParams,
  SuggestionListResult,
} from "@/features/suggestions/types/suggestions.types";
import type { BulkDeleteApiResult } from "@/shared/lib/api";

/** Suggestions come from the public form, so there is no create here. */
export interface SuggestionsService {
  list(params?: SuggestionListParams, signal?: AbortSignal): Promise<SuggestionListResult>;
  getById(id: number): Promise<Suggestion>;
  update(id: number, data: Partial<SuggestionFormData>): Promise<Suggestion>;
  accept(id: number, data: SuggestionAcceptData): Promise<Suggestion>;
  reject(id: number, reason: string): Promise<Suggestion>;
  delete(id: number): Promise<void>;
  bulkDelete(ids: Array<string | number>): Promise<BulkDeleteApiResult>;
}
