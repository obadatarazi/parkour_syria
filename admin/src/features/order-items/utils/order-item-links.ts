import { orderViewPath, productViewPath } from "@/app/router/routes";
import type { OrderItem } from "@/features/order-items/types/order-items.types";

/** Deep-link to Orders filtered by `orderRefNumber` (exact API filter, not free-text search). */
export function orderItemOrderHref(
  item: Pick<OrderItem, "orderId" | "orderRefNumber">,
): string | null {
  const ref = item.orderRefNumber?.trim();
  if (ref) {
    return orderViewPath(ref);
  }
  if (item.orderId > 0) {
    return orderViewPath(String(item.orderId));
  }
  return null;
}

export function orderItemProductHref(
  item: Pick<OrderItem, "productId" | "product">,
): string | null {
  const id = item.productId ?? item.product?.id;
  if (!id) return null;
  return productViewPath(String(id));
}
