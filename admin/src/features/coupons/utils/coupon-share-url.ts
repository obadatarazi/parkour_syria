import { env } from "@/shared/lib/env";

/**
 * One share link for both locales — built from the coupon code + storefront base.
 * Backend stores this as a single non-translated `couponUrl` field.
 */
export function getCouponShareUrl(code: string | null | undefined): string | null {
  const trimmed = code?.trim().toUpperCase();
  if (!trimmed) return null;
  return `${env.storefrontUrl}/?coupon=${encodeURIComponent(trimmed)}`;
}
