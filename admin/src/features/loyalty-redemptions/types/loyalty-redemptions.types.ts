import type { LoyaltyReward } from "@/features/loyalty-rewards/types/loyalty-rewards.types";
import type { OrderUserRef } from "@/features/orders/types/orders.types";
import type { PaginatedResult } from "@/shared/types";

export type LoyaltyRedemptionEnumOption = {
  label: string;
  value: string;
};

export type LoyaltyRedemption = {
  id: number;
  points: number;
  status?: LoyaltyRedemptionEnumOption | null;
  redeemedAt?: string | null;
  expiresAt?: string | null;
  userId?: number | null;
  user?: OrderUserRef | null;
  loyaltyAccountId?: number | null;
  loyaltyReward?: LoyaltyReward | null;
  createdAt?: string;
  updatedAt?: string;
};

export type LoyaltyRedemptionListParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  userId?: number;
  loyaltyRewardId?: number;
  sort?: string;
  direction?: "asc" | "desc";
};

export type LoyaltyRedemptionListResult = PaginatedResult<LoyaltyRedemption>;
