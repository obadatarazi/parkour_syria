import type { TranslationsInput } from "@/shared/lib/api/form-data.utils";
import {
  hasFormChanges,
  pickChangedScalar,
  pickChangedTranslations,
} from "@/shared/lib/form/pick-changed-fields";
import type { PaginatedResult } from "@/shared/types";

export type PromotionEnumOption = {
  label: string;
  value: string;
};

export type PromotionUsageSummary = {
  usedCount: number;
  usageLimit: number | null;
  remaining: number | null;
  totalGivenAway: number;
};

export type PromotionUsageRow = {
  id: number;
  userId?: number | null;
  userName?: string | null;
  userEmail?: string | null;
  cartUuid?: string | null;
  orderId?: number | null;
  orderRefNumber?: string | null;
  pricePromotions: number;
  usedAt?: string | null;
};

export type PromotionItemImage = {
  id: number;
  imageFileUrl?: string | null;
  featured: boolean;
};

export type PromotionItem = {
  type: "SIMPLE" | "VARIABLE_PRODUCT";
  productId?: number | null;
  productVariantId?: number | null;
  title?: string | null;
  skuCode?: string | null;
  price?: number | null;
  priceDiscount?: number | null;
  effectivePrice?: number | null;
  stock?: number | null;
  images?: PromotionItemImage[];
  brand?: { id: number; title?: string | null } | null;
  categories?: Array<{ id: number; title?: string | null }>;
  tags?: Array<{ id: number; title?: string | null }>;
  attributeValues?: Array<{
    id: number;
    title?: string | null;
    attribute?: { id: number; title?: string | null } | null;
  }>;
};

export type BogoCondition = {
  id: number;
  bogoPromotionId: number;
  productId?: number | null;
  productVariantId?: number | null;
  itemType?: "PRODUCT" | "PRODUCT_VARIANT" | string | null;
  item?: PromotionItem | null;
  quantity: number;
  createdAt?: string;
  updatedAt?: string;
};

export type BogoReward = {
  id: number;
  bogoPromotionId: number;
  productId?: number | null;
  productVariantId?: number | null;
  itemType?: "PRODUCT" | "PRODUCT_VARIANT" | string | null;
  item?: PromotionItem | null;
  quantity: number;
  discountType?: PromotionEnumOption | null;
  discountValue: number;
  unitPrice?: number | null;
  createdAt?: string;
  updatedAt?: string;
};

export type BogoPromotion = {
  id: number;
  promotionId: number;
  buyQuantity: number;
  getQuantity: number;
  maxRewards?: number | null;
  conditionsCount?: number;
  rewardsCount?: number;
  conditions?: BogoCondition[];
  rewards?: BogoReward[];
  promotion?: {
    id: number;
    code?: string | null;
    name?: string | null;
    isActive?: boolean;
  } | null;
  createdAt?: string;
  updatedAt?: string;
};

export type Promotion = {
  id: number;
  name?: string | null;
  description?: string | null;
  code: string;
  type?: PromotionEnumOption | null;
  usageLimit?: number | null;
  usageLimitPerUser?: number | null;
  isUnlimitedUsage?: boolean;
  isUnlimitedUsagePerUser?: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  isLifetime: boolean;
  isActive: boolean;
  isRequireLogin: boolean;
  priority: number;
  bogoPromotions?: BogoPromotion[];
  usageSummary?: PromotionUsageSummary | null;
  usages?: PromotionUsageRow[];
  translations?: TranslationsInput;
  createdAt?: string;
  updatedAt?: string;
};

export type PromotionListParams = {
  page?: number;
  limit?: number;
  search?: string;
  code?: string;
  type?: string;
  isActive?: boolean;
  isRequireLogin?: boolean;
  isRunning?: boolean;
  sort?: string;
  direction?: "asc" | "desc";
};

export type PromotionFormData = {
  translations: TranslationsInput;
  code: string;
  type: string;
  usageLimit: number | null;
  usageLimitPerUser: number | null;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  isRequireLogin: boolean;
  priority: number | null;
};

export type PromotionListResult = PaginatedResult<Promotion>;

export type BogoPromotionFormData = {
  promotionId: number;
  buyQuantity: number;
  getQuantity: number;
  maxRewards: number | null;
};

export type BogoConditionFormData = {
  bogoPromotionId: number;
  productId: number | null;
  productVariantId: number | null;
  quantity: number;
};

export type BogoRewardFormData = {
  bogoPromotionId: number;
  productId: number | null;
  productVariantId: number | null;
  quantity: number;
  discountType: string;
  discountValue: number;
};

export type PromotionUsage = {
  id: number;
  promotionId: number;
  code: string;
  pricePromotions: number;
  usedAt?: string | null;
  userId?: number | null;
  cartUuid?: string | null;
  orderId?: number | null;
  promotionName?: string | null;
  user?: {
    id: number;
    name?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
  } | null;
  order?: {
    id: number;
    orderRefNumber?: string | null;
    status?: string | null;
    totalPriceWithTax?: number | null;
  } | null;
  promotion?: {
    id: number;
    code?: string | null;
    name?: string | null;
    type?: string | null;
    isActive?: boolean;
  } | null;
  createdAt?: string;
  updatedAt?: string;
};

export type PromotionUsageListParams = {
  page?: number;
  limit?: number;
  search?: string;
  promotionId?: number;
  userId?: number;
  orderId?: number;
  cartUuid?: string;
  code?: string;
  usedFrom?: string;
  usedTo?: string;
  sort?: string;
  direction?: "asc" | "desc";
};

/** API `Y-m-d H:i:s` → `datetime-local` value. */
export function toDatetimeLocalValue(value?: string | null): string {
  if (!value?.trim()) return "";
  return value.trim().replace(" ", "T").slice(0, 16);
}

/** `datetime-local` → API `Y-m-d H:i:s` (empty clears). */
export function fromDatetimeLocalValue(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const normalized = trimmed.includes("T") ? trimmed.replace("T", " ") : trimmed;
  return normalized.length === 16 ? `${normalized}:00` : normalized;
}

export function createEmptyPromotionForm(): PromotionFormData {
  return {
    translations: {
      en: { title: "", description: "" },
      ar: { title: "", description: "" },
    },
    code: "",
    type: "BOGO",
    usageLimit: null,
    usageLimitPerUser: null,
    startsAt: "",
    endsAt: "",
    isActive: true,
    isRequireLogin: false,
    priority: 1,
  };
}

export function promotionToFormData(promotion: Promotion): PromotionFormData {
  return {
    translations: {
      en: {
        title: promotion.translations?.en?.title ?? promotion.name ?? "",
        description: promotion.translations?.en?.description ?? promotion.description ?? "",
      },
      ar: {
        title: promotion.translations?.ar?.title ?? "",
        description: promotion.translations?.ar?.description ?? "",
      },
    },
    code: promotion.code ?? "",
    type: promotion.type?.value ?? "BOGO",
    usageLimit: promotion.usageLimit ?? null,
    usageLimitPerUser: promotion.usageLimitPerUser ?? null,
    startsAt: toDatetimeLocalValue(promotion.startsAt),
    endsAt: toDatetimeLocalValue(promotion.endsAt),
    isActive: Boolean(promotion.isActive),
    isRequireLogin: Boolean(promotion.isRequireLogin),
    priority: promotion.priority ?? null,
  };
}

export function pickPromotionFormChanges(
  original: PromotionFormData,
  current: PromotionFormData,
): Partial<PromotionFormData> {
  const changes: Partial<PromotionFormData> = {
    ...pickChangedScalar(original, current, [
      "code",
      "type",
      "usageLimit",
      "usageLimitPerUser",
      "startsAt",
      "endsAt",
      "isActive",
      "isRequireLogin",
      "priority",
    ]),
  };

  const translationChanges = pickChangedTranslations(original.translations, current.translations);
  if (translationChanges) {
    changes.translations = translationChanges;
  }

  return changes;
}

export function hasPromotionFormChanges(
  original: PromotionFormData,
  current: PromotionFormData,
): boolean {
  return hasFormChanges(pickPromotionFormChanges(original, current));
}

export function createEmptyBogoDealForm(promotionId: number): BogoPromotionFormData {
  return {
    promotionId,
    buyQuantity: 2,
    getQuantity: 1,
    maxRewards: null,
  };
}

export function bogoDealToFormData(deal: BogoPromotion): BogoPromotionFormData {
  return {
    promotionId: deal.promotionId,
    buyQuantity: deal.buyQuantity,
    getQuantity: deal.getQuantity,
    maxRewards: deal.maxRewards ?? null,
  };
}

export function createEmptyBogoConditionForm(bogoPromotionId: number): BogoConditionFormData {
  return {
    bogoPromotionId,
    productId: null,
    productVariantId: null,
    quantity: 1,
  };
}

export function createEmptyBogoRewardForm(bogoPromotionId: number): BogoRewardFormData {
  return {
    bogoPromotionId,
    productId: null,
    productVariantId: null,
    quantity: 1,
    discountType: "PERCENTAGE",
    discountValue: 100,
  };
}

export function conditionToFormData(condition: BogoCondition): BogoConditionFormData {
  return {
    bogoPromotionId: condition.bogoPromotionId,
    productId: condition.productId ?? null,
    productVariantId: condition.productVariantId ?? null,
    quantity: condition.quantity,
  };
}

export function rewardToFormData(reward: BogoReward): BogoRewardFormData {
  return {
    bogoPromotionId: reward.bogoPromotionId,
    productId: reward.productId ?? null,
    productVariantId: reward.productVariantId ?? null,
    quantity: reward.quantity,
    discountType: reward.discountType?.value ?? "PERCENTAGE",
    discountValue: reward.discountValue,
  };
}
