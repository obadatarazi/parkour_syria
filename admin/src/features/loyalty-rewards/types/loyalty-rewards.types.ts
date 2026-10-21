import {
  hasFormChanges,
  pickChangedScalar,
} from "@/shared/lib/form/pick-changed-fields";
import type { LoyaltyTranslationsInput } from "@/shared/lib/loyalty/loyalty-translations.utils";
import {
  createEmptyLoyaltyTranslations,
  mapLoyaltyTranslationsFromApi,
} from "@/shared/lib/loyalty/loyalty-translations.utils";
import type { PaginatedResult } from "@/shared/types";

export type LoyaltyRewardEnumOption = {
  label: string;
  value: string;
};

export type LoyaltyReward = {
  id: number;
  code: string;
  name?: string | null;
  description?: string | null;
  type?: LoyaltyRewardEnumOption | null;
  pointsCost: number;
  rewardValue?: number | null;
  usageLimit?: number | null;
  expiresAfterDays?: number | null;
  isActive: boolean;
  conditions?: Record<string, unknown> | null;
  translations?: LoyaltyTranslationsInput;
  createdAt?: string;
  updatedAt?: string;
};

export type LoyaltyRewardListParams = {
  page?: number;
  limit?: number;
  search?: string;
  code?: string;
  type?: string;
  isActive?: boolean;
  sort?: string;
  direction?: "asc" | "desc";
};

export type LoyaltyRewardFormData = {
  code: string;
  type: string;
  pointsCost: number;
  rewardValue: number | null;
  usageLimit: number | null;
  expiresAfterDays: number | null;
  isActive: boolean;
  minimumCartTotal: number | null;
  translations: LoyaltyTranslationsInput;
};

export type LoyaltyRewardListResult = PaginatedResult<LoyaltyReward>;

export function extractMinimumCartTotal(
  conditions?: Record<string, unknown> | null,
): number | null {
  if (!conditions || typeof conditions !== "object") return null;

  const value = conditions.minimum_total_price ?? conditions.minimumTotalPrice;
  if (value == null || value === "") return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function createEmptyLoyaltyRewardForm(): LoyaltyRewardFormData {
  return {
    code: "",
    type: "PERCENTAGE",
    pointsCost: 1,
    rewardValue: null,
    usageLimit: null,
    expiresAfterDays: null,
    isActive: true,
    minimumCartTotal: null,
    translations: createEmptyLoyaltyTranslations(),
  };
}

export function loyaltyRewardToFormData(reward: LoyaltyReward): LoyaltyRewardFormData {
  const type = reward.type?.value ?? "PERCENTAGE";
  const isFreeShipping = type === "FREE_SHIPPING";

  return {
    code: reward.code ?? "",
    type,
    pointsCost: Number(reward.pointsCost ?? 1),
    rewardValue: isFreeShipping
      ? null
      : reward.rewardValue == null
        ? null
        : Number(reward.rewardValue),
    usageLimit: reward.usageLimit ?? null,
    expiresAfterDays: reward.expiresAfterDays ?? null,
    isActive: Boolean(reward.isActive),
    minimumCartTotal: extractMinimumCartTotal(reward.conditions),
    translations: mapLoyaltyTranslationsFromApi(reward.translations, reward.name),
  };
}

export function pickLoyaltyRewardFormChanges(
  original: LoyaltyRewardFormData,
  current: LoyaltyRewardFormData,
): Partial<LoyaltyRewardFormData> {
  const changes: Partial<LoyaltyRewardFormData> = {
    ...pickChangedScalar(original, current, [
      "code",
      "type",
      "pointsCost",
      "usageLimit",
      "expiresAfterDays",
      "isActive",
      "minimumCartTotal",
    ]),
  };

  const currentIsFreeShipping = current.type === "FREE_SHIPPING";
  const originalIsFreeShipping = original.type === "FREE_SHIPPING";

  if (currentIsFreeShipping) {
    if (!originalIsFreeShipping || original.rewardValue !== null) {
      changes.rewardValue = null;
    }
  } else if (original.rewardValue !== current.rewardValue) {
    changes.rewardValue = current.rewardValue;
  }

  if (original.type !== current.type) {
    changes.type = current.type;
  }

  const locales: Array<"en" | "ar"> = ["en", "ar"];
  let translationsChanged = false;
  for (const locale of locales) {
    const before = original.translations[locale];
    const after = current.translations[locale];
    if (
      (before?.name ?? "").trim() !== (after?.name ?? "").trim() ||
      (before?.description ?? "").trim() !== (after?.description ?? "").trim()
    ) {
      translationsChanged = true;
      break;
    }
  }

  if (translationsChanged) {
    changes.translations = current.translations;
  }

  return changes;
}

export function hasLoyaltyRewardFormChanges(
  original: LoyaltyRewardFormData,
  current: LoyaltyRewardFormData,
): boolean {
  return hasFormChanges(pickLoyaltyRewardFormChanges(original, current));
}
