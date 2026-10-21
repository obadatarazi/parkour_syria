import type {
  LoyaltyRedemption,
  LoyaltyRedemptionListParams,
  LoyaltyRedemptionListResult,
} from "@/features/loyalty-redemptions/types/loyalty-redemptions.types";

export interface LoyaltyRedemptionsService {
  list(
    params?: LoyaltyRedemptionListParams,
    signal?: AbortSignal,
  ): Promise<LoyaltyRedemptionListResult>;
  getById(id: number, signal?: AbortSignal): Promise<LoyaltyRedemption>;
}
