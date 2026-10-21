import { customerCrmHref } from "@/features/customers/utils/customer-links";
import type { EnumLabelValue, Order, OrderUserRef } from "@/features/orders/types/orders.types";
import type { StatusBadgeVariant } from "@/shared/components";

export type OrderCreatedByValue = "ADMIN" | "CUSTOMER" | "GUEST";

export type OrderPartyDisplay = {
  fullName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  userId?: number | null;
  createdBy?: EnumLabelValue | null;
  createdByAdmin?: OrderUserRef | null;
};

export function getOrderCreatedByValue(
  createdBy?: EnumLabelValue | null,
): OrderCreatedByValue | null {
  const value = createdBy?.value?.toUpperCase();
  if (value === "ADMIN" || value === "CUSTOMER" || value === "GUEST") {
    return value;
  }
  return null;
}

export function orderPartyDisplayName(
  party: OrderPartyDisplay | null | undefined,
  fallback: string,
): string {
  return party?.fullName?.trim() || party?.email?.trim() || fallback;
}

export function orderCreatedByBadge(
  party: OrderPartyDisplay | null | undefined,
  labels: { admin: string; customer: string; guest: string },
): { label: string; variant: StatusBadgeVariant } {
  const value = getOrderCreatedByValue(party?.createdBy);
  const apiLabel = party?.createdBy?.label?.trim();

  switch (value) {
    case "ADMIN":
      return { label: apiLabel || labels.admin, variant: "info" };
    case "CUSTOMER":
      return { label: apiLabel || labels.customer, variant: "success" };
    case "GUEST":
      return { label: apiLabel || labels.guest, variant: "neutral" };
    default:
      return {
        label: apiLabel || (party?.userId ? labels.customer : labels.guest),
        variant: party?.userId ? "success" : "neutral",
      };
  }
}

/** Registered customers only — opens CRM customer file. */
export function orderCustomerHref(party: OrderPartyDisplay | null | undefined): string | null {
  return customerCrmHref(party?.userId);
}

export function mapOrderToPartyDisplay(order: Order): OrderPartyDisplay {
  return {
    fullName: order.fullName || order.user?.fullName,
    email: order.email || order.user?.email,
    phoneNumber: order.phoneNumber || order.user?.phoneNumber,
    userId: order.user?.id ?? null,
    createdBy: order.createdBy,
    createdByAdmin: order.createdByAdmin,
  };
}
