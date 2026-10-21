import type {
  StaticPromotion,
  StaticPromotionFormData,
  StaticPromotionListParams,
} from "@/features/static-promotions/types/static-promotions.types";
import type { BulkDeleteApiResult } from "@/shared/lib/api";
import type { PaginatedResult } from "@/shared/types";

export interface StaticPromotionsService {
  list(params?: StaticPromotionListParams, signal?: AbortSignal): Promise<PaginatedResult<StaticPromotion>>;
  getById(id: number): Promise<StaticPromotion>;
  create(data: StaticPromotionFormData): Promise<StaticPromotion>;
  update(id: number, data: Partial<StaticPromotionFormData>): Promise<StaticPromotion>;
  delete(id: number): Promise<void>;
  bulkDelete(ids: Array<string | number>): Promise<BulkDeleteApiResult>;
}
