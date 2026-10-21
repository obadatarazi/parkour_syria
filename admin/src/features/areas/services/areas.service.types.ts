import type {
  Area,
  AreaFormData,
  AreaListParams,
  AreaListResult,
} from "@/features/areas/types/areas.types";
import type { BulkDeleteApiResult } from "@/shared/lib/api";

export interface AreasService {
  list(params?: AreaListParams, signal?: AbortSignal): Promise<AreaListResult>;
  getById(id: number): Promise<Area>;
  create(data: AreaFormData): Promise<Area>;
  update(id: number, data: Partial<AreaFormData>): Promise<Area>;
  delete(id: number): Promise<void>;
  bulkDelete(ids: Array<string | number>): Promise<BulkDeleteApiResult>;
}
