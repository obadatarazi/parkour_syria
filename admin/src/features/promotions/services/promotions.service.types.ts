import type {
  Promotion,
  PromotionFormData,
  PromotionListParams,
  PromotionListResult,
} from "@/features/promotions/types/promotions.types";
import type { BulkDeleteApiResult } from "@/shared/lib/api";

export interface PromotionsService {
  list(params?: PromotionListParams, signal?: AbortSignal): Promise<PromotionListResult>;
  getById(id: number, signal?: AbortSignal): Promise<Promotion>;
  getByCodeOrId(idOrCode: number | string, signal?: AbortSignal): Promise<Promotion>;
  resolveRouteKey(routeKey: string, signal?: AbortSignal): Promise<Promotion>;
  create(data: PromotionFormData): Promise<Promotion>;
  update(id: number, data: Partial<PromotionFormData>): Promise<Promotion>;
  delete(id: number): Promise<void>;
  bulkDelete(ids: Array<string | number>): Promise<BulkDeleteApiResult>;
}
