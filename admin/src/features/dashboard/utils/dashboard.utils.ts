import type { OrderStatusLabel } from "@/features/dashboard/types/dashboard.types";
import { getOrderStatusVariant } from "@/features/orders/utils/order-status.utils";
import type { StatusBadgeVariant } from "@/shared/components";
import { intlLocale } from "@/shared/lib/datetime.utils";

export function resolveOrderStatusVariant(status: OrderStatusLabel): StatusBadgeVariant {
  return getOrderStatusVariant(status.value);
}

export function formatOrderDate(createdAt: string, locale: string): string {
  return new Intl.DateTimeFormat(intlLocale(locale, "en-GB"), {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(createdAt));
}
