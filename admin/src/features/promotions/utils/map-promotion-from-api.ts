import type {
  BogoCondition,
  BogoPromotion,
  BogoReward,
  Promotion,
  PromotionItem,
  PromotionUsageRow,
  PromotionUsageSummary,
} from "@/features/promotions/types/promotions.types";
import type { TranslationsInput } from "@/shared/lib/api/form-data.utils";
import { normalizeTranslationsFromApi } from "@/shared/lib/api/normalize-translations.utils";

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

function mapEnumOption(
  option: { label?: string | null; value?: string | null } | string | null | undefined,
): { label: string; value: string } | null {
  if (option == null) return null;
  if (typeof option === "string") {
    return { label: option, value: option };
  }
  if (!option.value) return null;
  return {
    label: option.label ?? option.value,
    value: option.value,
  };
}

function nullableNumber(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

type ApiTranslationFields = {
  title?: string | null;
  name?: string | null;
  description?: string | null;
};

/** Promotion API uses `name`; admin TranslationFields expect `title`. */
function mapPromotionTranslations(translations: unknown, fallbackName?: string | null): TranslationsInput {
  const normalized = normalizeTranslationsFromApi<ApiTranslationFields>(translations);
  const result: TranslationsInput = {
    en: {
      title: normalized?.en?.title ?? normalized?.en?.name ?? (fallbackName ?? ""),
      description: normalized?.en?.description ?? "",
    },
    ar: {
      title: normalized?.ar?.title ?? normalized?.ar?.name ?? "",
      description: normalized?.ar?.description ?? "",
    },
  };
  return result;
}

function mapUsageSummary(raw: PromotionUsageSummary | null | undefined): PromotionUsageSummary | null {
  if (!raw) return null;
  return {
    usedCount: Number(raw.usedCount ?? 0),
    usageLimit: nullableNumber(raw.usageLimit),
    remaining: nullableNumber(raw.remaining),
    totalGivenAway: Number(raw.totalGivenAway ?? 0),
  };
}

function mapUsageRow(usage: PromotionUsageRow): PromotionUsageRow {
  return {
    ...usage,
    pricePromotions: Number(usage.pricePromotions ?? 0),
  };
}

function mapPromotionItem(item: PromotionItem | null | undefined): PromotionItem | null {
  if (!item) return null;
  return {
    ...item,
    price: nullableNumber(item.price) ?? undefined,
    priceDiscount: nullableNumber(item.priceDiscount) ?? undefined,
    effectivePrice: nullableNumber(item.effectivePrice) ?? undefined,
    stock: nullableNumber(item.stock) ?? undefined,
  };
}

export function mapBogoConditionFromApi(condition: BogoCondition): BogoCondition {
  return {
    ...condition,
    productId: nullableNumber(condition.productId),
    productVariantId: nullableNumber(condition.productVariantId),
    quantity: Number(condition.quantity ?? 1),
    item: mapPromotionItem(condition.item),
  };
}

export function mapBogoRewardFromApi(reward: BogoReward): BogoReward {
  return {
    ...reward,
    productId: nullableNumber(reward.productId),
    productVariantId: nullableNumber(reward.productVariantId),
    quantity: Number(reward.quantity ?? 1),
    discountValue: Number(reward.discountValue ?? 0),
    unitPrice: nullableNumber(reward.unitPrice),
    discountType: mapEnumOption(reward.discountType),
    item: mapPromotionItem(reward.item),
  };
}

export function mapBogoPromotionFromApi(deal: BogoPromotion): BogoPromotion {
  return {
    ...deal,
    buyQuantity: Number(deal.buyQuantity ?? 1),
    getQuantity: Number(deal.getQuantity ?? 1),
    maxRewards: nullableNumber(deal.maxRewards),
    conditionsCount: deal.conditionsCount == null ? undefined : Number(deal.conditionsCount),
    rewardsCount: deal.rewardsCount == null ? undefined : Number(deal.rewardsCount),
    conditions: (deal.conditions ?? []).map(mapBogoConditionFromApi),
    rewards: (deal.rewards ?? []).map(mapBogoRewardFromApi),
  };
}

export function mapPromotionFromApi(promotion: Promotion): Promotion {
  const raw = promotion as Promotion & Record<string, unknown>;
  const translations = mapPromotionTranslations(promotion.translations, promotion.name);

  return {
    ...promotion,
    name: promotion.name ?? translations.en?.title ?? null,
    description: promotion.description ?? translations.en?.description ?? null,
    isActive: firstBoolean(raw.isActive, raw.is_active),
    isRequireLogin: firstBoolean(raw.isRequireLogin, raw.is_require_login),
    isLifetime: firstBoolean(raw.isLifetime, raw.is_lifetime),
    isUnlimitedUsage: firstBoolean(raw.isUnlimitedUsage),
    isUnlimitedUsagePerUser: firstBoolean(raw.isUnlimitedUsagePerUser),
    usageLimit: nullableNumber(promotion.usageLimit),
    usageLimitPerUser: nullableNumber(promotion.usageLimitPerUser),
    priority: Number(promotion.priority ?? 0),
    type: mapEnumOption(promotion.type),
    usageSummary: mapUsageSummary(promotion.usageSummary),
    usages: (promotion.usages ?? []).map(mapUsageRow),
    bogoPromotions: (promotion.bogoPromotions ?? []).map(mapBogoPromotionFromApi),
    translations,
  };
}
