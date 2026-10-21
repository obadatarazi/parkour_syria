import type { Coupon } from "@/features/coupons/types/coupons.types";
import { mapTranslatableFromApi } from "@/shared/lib/api";

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

export function mapCouponFromApi(coupon: Coupon): Coupon {
  const raw = coupon as Coupon & Record<string, unknown>;
  const isFirstOrderOnly = firstBoolean(
    raw.isFirstOrderOnly,
    raw.isFiristOrderOnly,
    raw.is_first_order_only,
    raw.is_firist_order_only,
  );
  const isRequireLogin = firstBoolean(
    raw.isRequireLogin,
    raw.isRequierLogin,
    raw.is_require_login,
    raw.is_requier_login,
  );

  return {
    ...coupon,
    isAutoApply: firstBoolean(raw.isAutoApply, raw.is_auto_apply),
    isCombinable: firstBoolean(raw.isCombinable, raw.is_combinable),
    isFirstOrderOnly,
    isRequireLogin,
    isFiristOrderOnly: isFirstOrderOnly,
    isRequierLogin: isRequireLogin,
    isNotifyUsers: firstBoolean(raw.isNotifyUsers, raw.is_notify_users),
    isAdminOnly: firstBoolean(raw.isAdminOnly, raw.is_admin_only),
    minimumTotalPrice:
      coupon.minimumTotalPrice == null ? null : Number(coupon.minimumTotalPrice),
    usageLimit: coupon.usageLimit == null ? null : Number(coupon.usageLimit),
    usageLimitPerUser:
      coupon.usageLimitPerUser == null ? null : Number(coupon.usageLimitPerUser),
    priority: coupon.priority == null ? null : Number(coupon.priority),
    usageSummary: coupon.usageSummary
      ? {
          usedCount: Number(coupon.usageSummary.usedCount ?? 0),
          usageLimit:
            coupon.usageSummary.usageLimit == null
              ? null
              : Number(coupon.usageSummary.usageLimit),
          remaining:
            coupon.usageSummary.remaining == null
              ? null
              : Number(coupon.usageSummary.remaining),
          totalDiscountGiven: Number(coupon.usageSummary.totalDiscountGiven ?? 0),
        }
      : null,
    usages: (coupon.usages ?? []).map((usage) => ({
      ...usage,
      discountPrice: Number(usage.discountPrice ?? 0),
    })),
    type: mapEnumOption(coupon.type),
    scope: mapEnumOption(coupon.scope),
    status: mapEnumOption(coupon.status),
    audience: mapEnumOption(coupon.audience),
    applicableTo: (coupon.applicableTo ?? [])
      .map((item) => mapEnumOption(item))
      .filter((item): item is { label: string; value: string } => item != null)
      .filter((item) => item.value !== "USER"),
    products: coupon.products ?? [],
    productVariants: coupon.productVariants ?? [],
    brands: coupon.brands ?? [],
    categories: (coupon.categories ?? []).map((item) =>
      mapTranslatableFromApi({
        id: item.id,
        title: item.title ?? "",
      }),
    ),
    tags: (coupon.tags ?? []).map((item) =>
      mapTranslatableFromApi({
        id: item.id,
        title: item.title ?? "",
      }),
    ),
    users: coupon.users ?? [],
    translations: coupon.translations,
  };
}
