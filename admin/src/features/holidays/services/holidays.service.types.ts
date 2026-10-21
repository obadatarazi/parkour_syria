import type {
  Holiday,
  HolidayFormData,
  HolidayListParams,
  HolidayListResult,
} from "@/features/holidays/types/holidays.types";
import type { BulkDeleteApiResult } from "@/shared/lib/api";

export interface HolidaysService {
  list(params?: HolidayListParams, signal?: AbortSignal): Promise<HolidayListResult>;
  getById(id: number, signal?: AbortSignal): Promise<Holiday>;
  create(data: HolidayFormData): Promise<Holiday>;
  update(id: number, data: Partial<HolidayFormData>): Promise<Holiday>;
  delete(id: number): Promise<void>;
  bulkDelete(ids: Array<string | number>): Promise<BulkDeleteApiResult>;
}
