import { getCouponShareUrl } from "@/features/coupons/utils/coupon-share-url";
import type { TranslationsInput } from "@/shared/lib/api/form-data.utils";
import {
  areNumberArraysEqual,
  hasFormChanges,
  pickChangedScalar,
  pickChangedTranslations,
} from "@/shared/lib/form/pick-changed-fields";
import type { PaginatedResult } from "@/shared/types";

export type CouponEnumOption = {
  label: string;
  value: string;
};

export type CouponScopeValue = "CART" | "ITEMS" | "SHIPPING";

export type CouponRelationItem = {
  id: number;
  title?: string | null;
  skuCode?: string | null;
};

export type CouponUserBinding = {
  id?: number;
  userId: number;
  name?: string | null;
  email?: string | null;
  usageLimit: number;
  usageCount?: number | null;
  startsAt?: string | null;
  expireAt?: string | null;
};

export type CouponUsageSummary = {
  usedCount: number;
  usageLimit: number | null;
  remaining: number | null;
  totalDiscountGiven: number;
};

export type CouponUsage = {
  id: number;
  userId?: number | null;
  userName?: string | null;
  userEmail?: string | null;
  cartUuid?: string | null;
  orderId?: number | null;
  orderRefNumber?: string | null;
  value?: string | null;
  discountPrice: number;
  usedAt?: string | null;
};

export type Coupon = {
  id: number;
  title?: string | null;
  description?: string | null;
  code: string;
  couponUrl?: string | null;
  type?: CouponEnumOption | null;
  scope?: CouponEnumOption | null;
  applicableTo?: CouponEnumOption[];
  value?: string | null;
  minimumTotalPrice?: number | null;
  usageLimit?: number | null;
  usageLimitPerUser?: number | null;
  isAutoApply: boolean;
  isCombinable: boolean;
  isFirstOrderOnly: boolean;
  isRequireLogin: boolean;
  /** @deprecated Prefer isFirstOrderOnly; kept for legacy API aliases. */
  isFiristOrderOnly?: boolean;
  /** @deprecated Prefer isRequireLogin; kept for legacy API aliases. */
  isRequierLogin?: boolean;
  isNotifyUsers: boolean;
  isAdminOnly: boolean;
  priority?: number | null;
  startsAt?: string | null;
  expireAt?: string | null;
  status?: CouponEnumOption | null;
  audience?: CouponEnumOption | null;
  usageSummary?: CouponUsageSummary | null;
  usages?: CouponUsage[];
  products?: CouponRelationItem[];
  productVariants?: CouponRelationItem[];
  brands?: CouponRelationItem[];
  categories?: CouponRelationItem[];
  tags?: CouponRelationItem[];
  users?: CouponUserBinding[];
  translations?: TranslationsInput;
  createdAt?: string;
  updatedAt?: string;
};

export type CouponListParams = {
  page?: number;
  limit?: number;
  search?: string;
  code?: string;
  type?: string;
  scope?: string;
  status?: string;
  audience?: string;
  applicableTo?: string[];
  isAutoApply?: boolean;
  isCombinable?: boolean;
  isFirstOrderOnly?: boolean;
  isRequireLogin?: boolean;
  isAdminOnly?: boolean;
  sort?: string;
  direction?: "asc" | "desc";
};

export type CouponUserFormItem = {
  userId: number | null;
  usageLimit: number;
  usageCount: number;
  startsAt: string;
  expireAt: string;
  name?: string;
  email?: string;
};

export type CouponFormData = {
  translations: TranslationsInput;
  code: string;
  couponUrl: string;
  type: string;
  scope: CouponScopeValue;
  applicableTo: string[];
  value: string;
  minimumTotalPrice: number | null;
  usageLimit: number | null;
  usageLimitPerUser: number | null;
  isAutoApply: boolean;
  isCombinable: boolean;
  isFirstOrderOnly: boolean;
  isRequireLogin: boolean;
  isNotifyUsers: boolean;
  isAdminOnly: boolean;
  priority: number | null;
  startsAt: string;
  expireAt: string;
  status: string;
  audience: string;
  productIds: number[];
  productVariantIds: number[];
  brandIds: number[];
  categoryIds: number[];
  tagIds: number[];
  users: CouponUserFormItem[];
};

export type CouponListResult = PaginatedResult<Coupon>;

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

export function resolveCouponFirstOrderOnly(coupon: Coupon): boolean {
  return Boolean(coupon.isFirstOrderOnly ?? coupon.isFiristOrderOnly);
}

export function resolveCouponRequireLogin(coupon: Coupon): boolean {
  return Boolean(coupon.isRequireLogin ?? coupon.isRequierLogin);
}

export function createEmptyCouponForm(): CouponFormData {
  return {
    translations: {
      en: { title: "", description: "" },
      ar: { title: "", description: "" },
    },
    code: "",
    couponUrl: "",
    type: "PERCENTAGE",
    scope: "CART",
    applicableTo: [],
    value: "",
    minimumTotalPrice: null,
    usageLimit: null,
    usageLimitPerUser: null,
    isAutoApply: false,
    isCombinable: false,
    isFirstOrderOnly: false,
    isRequireLogin: false,
    isNotifyUsers: false,
    isAdminOnly: false,
    priority: null,
    startsAt: "",
    expireAt: "",
    status: "DRAFT",
    audience: "EVERYONE",
    productIds: [],
    productVariantIds: [],
    brandIds: [],
    categoryIds: [],
    tagIds: [],
    users: [],
  };
}

export function couponToFormData(coupon: Coupon): CouponFormData {
  const code = coupon.code ?? "";
  const type = coupon.type?.value ?? "PERCENTAGE";
  const scopeValue = coupon.scope?.value;
  const scope: CouponScopeValue =
    scopeValue === "CART" || scopeValue === "ITEMS" || scopeValue === "SHIPPING"
      ? scopeValue
      : type === "FREE_SHIPPING"
        ? "SHIPPING"
        : "CART";

  return {
    translations: {
      en: {
        title: coupon.translations?.en?.title ?? coupon.title ?? "",
        description: coupon.translations?.en?.description ?? coupon.description ?? "",
      },
      ar: {
        title: coupon.translations?.ar?.title ?? "",
        description: coupon.translations?.ar?.description ?? "",
      },
    },
    code,
    couponUrl: getCouponShareUrl(code) ?? coupon.couponUrl ?? "",
    type,
    scope,
    applicableTo: (coupon.applicableTo ?? [])
      .map((item) => item.value)
      .filter((value) => value !== "USER"),
    value: coupon.value ?? "",
    minimumTotalPrice: coupon.minimumTotalPrice ?? null,
    usageLimit: coupon.usageLimit ?? null,
    usageLimitPerUser: coupon.usageLimitPerUser ?? null,
    isAutoApply: Boolean(coupon.isAutoApply),
    isCombinable: Boolean(coupon.isCombinable),
    isFirstOrderOnly: resolveCouponFirstOrderOnly(coupon),
    isRequireLogin: resolveCouponRequireLogin(coupon),
    isNotifyUsers: Boolean(coupon.isNotifyUsers),
    isAdminOnly: Boolean(coupon.isAdminOnly),
    priority: coupon.priority ?? null,
    startsAt: toDatetimeLocalValue(coupon.startsAt),
    expireAt: toDatetimeLocalValue(coupon.expireAt),
    status: coupon.status?.value ?? "DRAFT",
    audience: coupon.audience?.value ?? "EVERYONE",
    productIds: (coupon.products ?? []).map((item) => item.id),
    productVariantIds: (coupon.productVariants ?? []).map((item) => item.id),
    brandIds: (coupon.brands ?? []).map((item) => item.id),
    categoryIds: (coupon.categories ?? []).map((item) => item.id),
    tagIds: (coupon.tags ?? []).map((item) => item.id),
    users: (coupon.users ?? []).map((user) => ({
      userId: user.userId,
      usageLimit: user.usageLimit ?? 1,
      usageCount: user.usageCount ?? 0,
      startsAt: toDatetimeLocalValue(user.startsAt),
      expireAt: toDatetimeLocalValue(user.expireAt),
      name: user.name ?? undefined,
      email: user.email ?? undefined,
    })),
  };
}

function areUserRowsEqual(a: CouponUserFormItem[], b: CouponUserFormItem[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((row, index) => {
    const other = b[index];
    return (
      row.userId === other.userId &&
      Number(row.usageLimit) === Number(other.usageLimit) &&
      row.startsAt === other.startsAt &&
      row.expireAt === other.expireAt
    );
  });
}

export function pickCouponFormChanges(
  original: CouponFormData,
  current: CouponFormData,
): Partial<CouponFormData> {
  const changes: Partial<CouponFormData> = {
    ...pickChangedScalar(original, current, [
      "code",
      "couponUrl",
      "type",
      "scope",
      "value",
      "minimumTotalPrice",
      "usageLimit",
      "usageLimitPerUser",
      "isAutoApply",
      "isCombinable",
      "isFirstOrderOnly",
      "isRequireLogin",
      "isNotifyUsers",
      "isAdminOnly",
      "priority",
      "startsAt",
      "expireAt",
      "status",
      "audience",
    ]),
  };

  const translationChanges = pickChangedTranslations(original.translations, current.translations);
  if (translationChanges) {
    changes.translations = translationChanges;
  }

  if (original.applicableTo.join(",") !== current.applicableTo.join(",")) {
    changes.applicableTo = current.applicableTo;
  }

  if (!areNumberArraysEqual(original.productIds, current.productIds)) {
    changes.productIds = current.productIds;
  }
  if (!areNumberArraysEqual(original.productVariantIds, current.productVariantIds)) {
    changes.productVariantIds = current.productVariantIds;
  }
  if (!areNumberArraysEqual(original.brandIds, current.brandIds)) {
    changes.brandIds = current.brandIds;
  }
  if (!areNumberArraysEqual(original.categoryIds, current.categoryIds)) {
    changes.categoryIds = current.categoryIds;
  }
  if (!areNumberArraysEqual(original.tagIds, current.tagIds)) {
    changes.tagIds = current.tagIds;
  }
  if (!areUserRowsEqual(original.users, current.users)) {
    changes.users = current.users;
  }

  // Scope / audience changes must carry bindings so the API can validate CART/ITEMS/SHIPPING.
  if (changes.scope !== undefined || changes.audience !== undefined || changes.type !== undefined) {
    changes.applicableTo = current.applicableTo;
    changes.productIds = current.productIds;
    changes.productVariantIds = current.productVariantIds;
    changes.brandIds = current.brandIds;
    changes.categoryIds = current.categoryIds;
    changes.tagIds = current.tagIds;
    changes.users = current.users;
  }

  return changes;
}

export function hasCouponFormChanges(original: CouponFormData, current: CouponFormData): boolean {
  return hasFormChanges(pickCouponFormChanges(original, current));
}
