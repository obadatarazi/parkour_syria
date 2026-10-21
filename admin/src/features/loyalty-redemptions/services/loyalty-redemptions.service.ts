import type { LoyaltyRedemptionsService } from "@/features/loyalty-redemptions/services/loyalty-redemptions.service.types";
import { createApiLoyaltyRedemptionsService } from "@/features/loyalty-redemptions/services/loyalty-redemptions-api.service";

export const loyaltyRedemptionsService: LoyaltyRedemptionsService =
  createApiLoyaltyRedemptionsService();
