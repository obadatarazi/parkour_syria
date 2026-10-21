import type {
  Country,
  CountryFormData,
  CountryListParams,
  CountryListResult,
} from "@/features/countries/types/countries.types";
import type { BulkDeleteApiResult } from "@/shared/lib/api";

export interface CountriesService {
  list(params?: CountryListParams, signal?: AbortSignal): Promise<CountryListResult>;
  getById(id: number): Promise<Country>;
  create(data: CountryFormData): Promise<Country>;
  update(id: number, data: Partial<CountryFormData>): Promise<Country>;
  delete(id: number): Promise<void>;
  bulkDelete(ids: Array<string | number>): Promise<BulkDeleteApiResult>;
}
