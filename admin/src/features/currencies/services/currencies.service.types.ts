import type {
  Currency,
  CurrencyFormData,
  CurrencyListParams,
  CurrencyListResult,
} from "@/features/currencies/types/currencies.types";
import type { BulkDeleteApiResult } from "@/shared/lib/api";

export interface CurrenciesService {
  list(params?: CurrencyListParams, signal?: AbortSignal): Promise<CurrencyListResult>;
  getById(id: number): Promise<Currency>;
  create(data: CurrencyFormData): Promise<Currency>;
  update(id: number, data: Partial<CurrencyFormData>): Promise<Currency>;
  delete(id: number): Promise<void>;
  bulkDelete(ids: Array<string | number>): Promise<BulkDeleteApiResult>;
}
