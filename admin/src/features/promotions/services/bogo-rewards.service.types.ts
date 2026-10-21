import type {
  BogoReward,
  BogoRewardFormData,
} from "@/features/promotions/types/promotions.types";
import type { PaginatedResult } from "@/shared/types";

export type BogoRewardListParams = {
  page?: number;
  limit?: number;
  bogoPromotionId?: number;
  productId?: number;
  productVariantId?: number;
  sort?: string;
  direction?: "asc" | "desc";
};

export interface BogoRewardsService {
  list(
    params?: BogoRewardListParams,
    signal?: AbortSignal,
  ): Promise<PaginatedResult<BogoReward>>;
  getById(id: number, signal?: AbortSignal): Promise<BogoReward>;
  create(data: BogoRewardFormData): Promise<BogoReward>;
  update(id: number, data: Partial<BogoRewardFormData>): Promise<BogoReward>;
  delete(id: number): Promise<void>;
}
