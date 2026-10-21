import type {
  LoyaltyReward,
  LoyaltyRewardFormData,
  LoyaltyRewardListParams,
} from "@/features/loyalty-rewards/types/loyalty-rewards.types";
import type { BulkDeleteApiResult } from "@/shared/lib/api";

export type LoyaltyRewardsService = {
  list: (
    params?: LoyaltyRewardListParams,
    signal?: AbortSignal,
  ) => Promise<import("@/shared/types").PaginatedResult<LoyaltyReward>>;
  getById: (id: number, signal?: AbortSignal) => Promise<LoyaltyReward>;
  create: (data: LoyaltyRewardFormData) => Promise<LoyaltyReward>;
  update: (id: number, data: Partial<LoyaltyRewardFormData>) => Promise<LoyaltyReward>;
  delete: (id: number) => Promise<void>;
  bulkDelete: (ids: Array<string | number>) => Promise<BulkDeleteApiResult>;
};
