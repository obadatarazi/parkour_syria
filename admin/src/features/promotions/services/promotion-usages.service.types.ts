import type {
  PromotionUsage,
  PromotionUsageListParams,
} from "@/features/promotions/types/promotions.types";
import type { PaginatedResult } from "@/shared/types";

export interface PromotionUsagesService {
  list(
    params?: PromotionUsageListParams,
    signal?: AbortSignal,
  ): Promise<PaginatedResult<PromotionUsage>>;
  getById(id: number, signal?: AbortSignal): Promise<PromotionUsage>;
}
