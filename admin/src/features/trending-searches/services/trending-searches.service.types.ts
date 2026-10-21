import type {
  TrendingSearch,
  TrendingSearchFormData,
  TrendingSearchListParams,
  TrendingSearchListResult,
} from "@/features/trending-searches/types/trending-searches.types";
import type { BulkDeleteApiResult } from "@/shared/lib/api";

export interface TrendingSearchesService {
  list(
    params?: TrendingSearchListParams,
    signal?: AbortSignal,
  ): Promise<TrendingSearchListResult>;
  getById(id: number, signal?: AbortSignal): Promise<TrendingSearch>;
  create(data: TrendingSearchFormData): Promise<TrendingSearch>;
  update(id: number, data: Partial<TrendingSearchFormData>): Promise<TrendingSearch>;
  delete(id: number): Promise<void>;
  bulkDelete(ids: Array<string | number>): Promise<BulkDeleteApiResult>;
}
