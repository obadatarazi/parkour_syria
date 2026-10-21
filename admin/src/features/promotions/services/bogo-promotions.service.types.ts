import type {
  BogoPromotion,
  BogoPromotionFormData,
} from "@/features/promotions/types/promotions.types";
import type { PaginatedResult } from "@/shared/types";

export type BogoPromotionListParams = {
  page?: number;
  limit?: number;
  promotionId?: number;
  buyQuantity?: number;
  getQuantity?: number;
  sort?: string;
  direction?: "asc" | "desc";
};

export interface BogoPromotionsService {
  list(
    params?: BogoPromotionListParams,
    signal?: AbortSignal,
  ): Promise<PaginatedResult<BogoPromotion>>;
  getById(id: number, signal?: AbortSignal): Promise<BogoPromotion>;
  create(data: BogoPromotionFormData): Promise<BogoPromotion>;
  update(id: number, data: Partial<BogoPromotionFormData>): Promise<BogoPromotion>;
  delete(id: number): Promise<void>;
}
