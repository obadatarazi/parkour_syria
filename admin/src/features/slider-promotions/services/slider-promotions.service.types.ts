import type {
  SliderPromotion,
  SliderPromotionFormData,
  SliderPromotionListParams,
} from "@/features/slider-promotions/types/slider-promotions.types";
import type { BulkDeleteApiResult } from "@/shared/lib/api";
import type { PaginatedResult } from "@/shared/types";

export interface SliderPromotionsService {
  list(params?: SliderPromotionListParams, signal?: AbortSignal): Promise<PaginatedResult<SliderPromotion>>;
  getById(id: number): Promise<SliderPromotion>;
  create(data: SliderPromotionFormData): Promise<SliderPromotion>;
  update(id: number, data: Partial<SliderPromotionFormData>): Promise<SliderPromotion>;
  delete(id: number): Promise<void>;
  bulkDelete(ids: Array<string | number>): Promise<BulkDeleteApiResult>;
}
