import type { LoyaltyRedemption } from "@/features/loyalty-redemptions/types/loyalty-redemptions.types";
import { mapLoyaltyRewardFromApi } from "@/features/loyalty-rewards/utils/map-loyalty-reward-from-api";
import { mapLoyaltyEnumOption } from "@/shared/lib/loyalty/map-loyalty-enum.utils";

export function mapLoyaltyRedemptionFromApi(
  redemption: LoyaltyRedemption,
): LoyaltyRedemption {
  const raw = redemption as LoyaltyRedemption & Record<string, unknown>;

  return {
    ...redemption,
    points: Number(redemption.points ?? 0),
    userId:
      redemption.userId == null && raw.user_id == null
        ? null
        : Number(redemption.userId ?? raw.user_id ?? 0) || null,
    loyaltyAccountId:
      redemption.loyaltyAccountId == null && raw.loyalty_account_id == null
        ? null
        : Number(redemption.loyaltyAccountId ?? raw.loyalty_account_id ?? 0) || null,
    redeemedAt: redemption.redeemedAt ?? (raw.redeemed_at as string | null | undefined) ?? null,
    expiresAt: redemption.expiresAt ?? (raw.expires_at as string | null | undefined) ?? null,
    status: mapLoyaltyEnumOption(redemption.status),
    user: redemption.user ?? null,
    loyaltyReward: redemption.loyaltyReward
      ? mapLoyaltyRewardFromApi(redemption.loyaltyReward)
      : null,
  };
}

export function loyaltyRedemptionStatusVariant(
  value?: string | null,
): "success" | "warning" | "danger" | "info" | "neutral" {
  switch (value) {
    case "ACTIVE":
      return "success";
    case "USED":
      return "info";
    case "EXPIRED":
      return "danger";
    case "CANCELLED":
      return "neutral";
    default:
      return "neutral";
  }
}
