import {
  carePlanViewPath,
  couponViewPath,
  customerCrmPath,
  orderViewPath,
  prescriptionEditPath,
  productViewPath,
  ROUTES,
} from "@/app/router/routes";
import type { Notification } from "@/features/notifications/types/notifications.types";

/**
 * Normalize notification meta from the API.
 * Backend stores an array cast; older rows or odd payloads may arrive as JSON strings.
 */
export function normalizeNotificationMeta(
  meta: unknown,
): Record<string, unknown> | null {
  if (meta == null) return null;
  if (typeof meta === "string") {
    const trimmed = meta.trim();
    if (!trimmed) return null;
    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return null;
    }
    return null;
  }
  if (typeof meta === "object" && !Array.isArray(meta)) {
    return meta as Record<string, unknown>;
  }
  return null;
}

function metaNumber(
  meta: Record<string, unknown> | null | undefined,
  ...keys: string[]
): number | null {
  if (!meta) return null;
  for (const key of keys) {
    const raw = meta[key];
    const value = typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw) : NaN;
    if (Number.isFinite(value) && value > 0) return value;
  }
  return null;
}

function metaString(
  meta: Record<string, unknown> | null | undefined,
  ...keys: string[]
): string | null {
  if (!meta) return null;
  for (const key of keys) {
    const raw = meta[key];
    if (typeof raw === "string" && raw.trim()) return raw.trim();
  }
  return null;
}

/**
 * Resolves an Admin deep-link from notification `metaData` written by SendNotificationListener.
 * Keys: orderId, carePlanId, prescriptionId, couponId / couponCode, productReviewId + productId, userId, productId.
 */
export function getNotificationTargetHref(notification: Notification): string | null {
  const meta = normalizeNotificationMeta(notification.metaData);

  const orderRef = metaString(meta, "orderRefNumber", "order_ref_number", "orderNumber");
  if (orderRef) {
    return orderViewPath(orderRef);
  }

  const orderId = metaNumber(meta, "orderId", "order_id");
  if (orderId != null) {
    return orderViewPath(String(orderId));
  }

  const carePlanId = metaNumber(meta, "carePlanId", "care_plan_id");
  if (carePlanId != null) {
    return carePlanViewPath(carePlanId);
  }

  const prescriptionNumber = metaString(
    meta,
    "prescriptionNumber",
    "prescription_number",
    "rxNumber",
  );
  if (prescriptionNumber) {
    return prescriptionEditPath(prescriptionNumber);
  }

  const prescriptionId = metaNumber(meta, "prescriptionId", "prescription_id");
  if (prescriptionId != null) {
    return prescriptionEditPath(String(prescriptionId));
  }

  const couponCode = metaString(meta, "couponCode", "coupon_code", "code");
  if (couponCode) {
    return couponViewPath(couponCode);
  }

  const couponId = metaNumber(meta, "couponId", "coupon_id");
  if (couponId != null) {
    return couponViewPath(String(couponId));
  }

  const productReviewId = metaNumber(meta, "productReviewId", "product_review_id");
  const productIdForReview = metaNumber(meta, "productId", "product_id");
  if (productReviewId != null && productIdForReview != null) {
    return `${ROUTES.admin.productReviews}?id=${productReviewId}&productId=${productIdForReview}`;
  }

  const userId = metaNumber(meta, "userId", "user_id");
  if (userId != null) {
    return customerCrmPath(userId);
  }

  const productSlug = metaString(meta, "productSlug", "product_slug", "slug");
  if (productSlug) {
    return productViewPath(productSlug);
  }

  const productId = metaNumber(meta, "productId", "product_id");
  if (productId != null) {
    return productViewPath(String(productId));
  }

  return null;
}

export function hasNotificationTarget(notification: Notification): boolean {
  return getNotificationTargetHref(notification) != null;
}
