import type { LoyaltyReward } from "@/features/loyalty-rewards/types/loyalty-rewards.types";
import { mapLoyaltyEnumOption } from "@/shared/lib/loyalty/map-loyalty-enum.utils";
import { mapLoyaltyTranslationsFromApi } from "@/shared/lib/loyalty/loyalty-translations.utils";

function firstBoolean(...values: unknown[]): boolean {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    if (value === true || value === 1 || value === "1" || value === "true") return true;
    if (value === false || value === 0 || value === "0" || value === "false" || value === "") {
      return false;
    }
    return Boolean(value);
  }
  return false;
}

export function mapLoyaltyRewardFromApi(reward: LoyaltyReward): LoyaltyReward {
  const raw = reward as LoyaltyReward & Record<string, unknown>;

  return {
    ...reward,
    code: String(reward.code ?? ""),
    name: reward.name ?? null,
    description: reward.description ?? null,
    pointsCost: Number(reward.pointsCost ?? raw.points_cost ?? 0),
    rewardValue:
      reward.rewardValue == null && raw.reward_value == null
        ? null
        : Number(reward.rewardValue ?? raw.reward_value ?? 0),
    usageLimit:
      reward.usageLimit == null && raw.usage_limit == null
        ? null
        : Number(reward.usageLimit ?? raw.usage_limit),
    expiresAfterDays:
      reward.expiresAfterDays == null && raw.expires_after_days == null
        ? null
        : Number(reward.expiresAfterDays ?? raw.expires_after_days),
    isActive: firstBoolean(raw.isActive, raw.is_active),
    type: mapLoyaltyEnumOption(reward.type),
    conditions:
      reward.conditions && typeof reward.conditions === "object" ? reward.conditions : null,
    translations: mapLoyaltyTranslationsFromApi(
      reward.translations as Record<string, unknown> | undefined,
      reward.name,
    ),
  };
}
