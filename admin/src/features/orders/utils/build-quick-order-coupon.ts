import type { CouponFormData } from "@/features/coupons/types/coupons.types";
import { createEmptyCouponForm } from "@/features/coupons/types/coupons.types";
import { normalizeCouponFormForApi } from "@/features/coupons/utils/coupon-admin-scope";

export type QuickOrderCouponKind = "FIXED" | "PERCENTAGE" | "FREE_SHIPPING";

export type QuickOrderCouponInput = {
  kind: QuickOrderCouponKind;
  value: string;
  code?: string;
  titleEn?: string;
  titleAr?: string;
  isAdminOnly?: boolean;
};

function generateQuickCouponCode(): string {
  const suffix = Date.now().toString(36).toUpperCase().slice(-6);
  return `QORD-${suffix}`;
}

function defaultTitles(
  kind: QuickOrderCouponKind,
  value: string,
): { en: string; ar: string } {
  if (kind === "FREE_SHIPPING") {
    return { en: "Quick free shipping", ar: "شحن مجاني سريع" };
  }
  if (kind === "PERCENTAGE") {
    return {
      en: `Quick ${value}% off cart`,
      ar: `خصم سريع ${value}% على السلة`,
    };
  }
  return {
    en: `Quick ${value} KWD off cart`,
    ar: `خصم سريع ${value} د.ك على السلة`,
  };
}

/** Builds an ACTIVE cart/shipping coupon ready for `/admin/coupons` create. */
export function buildQuickOrderCouponForm(input: QuickOrderCouponInput): CouponFormData {
  const code = (input.code?.trim() || generateQuickCouponCode()).toUpperCase();
  const titles = defaultTitles(input.kind, input.value.trim());
  const titleEn = input.titleEn?.trim() || titles.en;
  const titleAr = input.titleAr?.trim() || titles.ar;
  const isFreeShipping = input.kind === "FREE_SHIPPING";

  const form: CouponFormData = {
    ...createEmptyCouponForm(),
    code,
    type: input.kind,
    scope: isFreeShipping ? "SHIPPING" : "CART",
    value: isFreeShipping ? "" : input.value.trim(),
    status: "ACTIVE",
    audience: "EVERYONE",
    isAdminOnly: input.isAdminOnly ?? true,
    usageLimit: 1,
    usageLimitPerUser: 1,
    isCombinable: true,
    isNotifyUsers: false,
    translations: {
      en: { title: titleEn, description: "" },
      ar: { title: titleAr, description: "" },
    },
  };

  return normalizeCouponFormForApi(form);
}
