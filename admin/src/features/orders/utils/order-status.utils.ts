import type { StatusBadgeVariant } from "@/shared/components";

/** Maps order status enum values to StatusBadge color variants. */
export function getOrderStatusVariant(value?: string | null): StatusBadgeVariant {
  switch (value) {
    case "COMPLETED":
    case "DELIVERED":
      return "success";
    case "PENDING_PAYMENT":
    case "PROCESSING":
    case "ON_HOLD":
      return "warning";
    case "READY_TO_PREPARE":
    case "ON_THE_WAY_TO_DELIVER_TODAY":
      return "info";
    case "CANCELLED":
    case "REFUNDED":
      return "danger";
    default:
      return "neutral";
  }
}
