import type {
  CarePlan,
  CarePlanCycle,
  CarePlanCycleTotals,
  CarePlanEnumOption,
  CarePlanItem,
  CarePlanUpcomingCycle,
} from "@/features/care-plans/types/care-plans.types";

function mapEnumOption(
  option: { label?: string | null; value?: string | null } | string | null | undefined,
): CarePlanEnumOption | null {
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

function toNumber(value: unknown, fallback = 0): number {
  if (value == null || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toNullableNumber(value: unknown): number | null {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapItem(item: CarePlanItem): CarePlanItem {
  return {
    ...item,
    productId: toNumber(item.productId),
    productVariantId: toNullableNumber(item.productVariantId),
    quantity: toNumber(item.quantity, 1),
    sortOrder: toNumber(item.sortOrder),
  };
}

function mapCycle(cycle: CarePlanCycle): CarePlanCycle {
  return {
    ...cycle,
    cycleNumber: toNumber(cycle.cycleNumber),
    frozenDiscountPercent: toNullableNumber(cycle.frozenDiscountPercent),
    orderId: toNullableNumber(cycle.orderId),
    status: mapEnumOption(cycle.status),
  };
}

function mapCycleTotals(
  totals: CarePlanCycleTotals | null | undefined,
): CarePlanCycleTotals | null {
  if (!totals) return null;
  return {
    discountPercent: toNumber(totals.discountPercent),
    subtotal: toNumber(totals.subtotal),
    discountAmount: toNumber(totals.discountAmount),
    deliveryFee: toNumber(totals.deliveryFee),
    taxAmount: toNumber(totals.taxAmount),
    total: toNumber(totals.total),
  };
}

function mapUpcomingCycle(cycle: CarePlanUpcomingCycle): CarePlanUpcomingCycle {
  return {
    ...cycle,
    cycleId: toNullableNumber(cycle.cycleId),
    cycleNumber: toNumber(cycle.cycleNumber),
    discountPercent: toNumber(cycle.discountPercent),
    estimatedTotal: toNumber(cycle.estimatedTotal),
    isPreview: Boolean(cycle.isPreview),
    isCurrent: Boolean(cycle.isCurrent),
    status: mapEnumOption(cycle.status),
  };
}

export function mapCarePlanFromApi(plan: CarePlan): CarePlan {
  return {
    ...plan,
    userId: toNumber(plan.userId),
    userAddressId: toNumber(plan.userAddressId),
    deliveryZonePriceId: toNullableNumber(plan.deliveryZonePriceId),
    paymentProviderId: toNumber(plan.paymentProviderId),
    preferredWeekday: toNullableNumber(plan.preferredWeekday),
    initialDiscountPercent: toNumber(plan.initialDiscountPercent),
    loyaltyDiscountPercent: toNumber(plan.loyaltyDiscountPercent),
    completedCyclesCount: toNumber(plan.completedCyclesCount),
    currentDiscountPercent: toNumber(plan.currentDiscountPercent),
    missedPaymentCount: toNumber(plan.missedPaymentCount),
    itemsCount: plan.itemsCount == null ? null : toNumber(plan.itemsCount),
    nextCycleTotals: mapCycleTotals(plan.nextCycleTotals),
    upcomingCycles: (plan.upcomingCycles ?? []).map(mapUpcomingCycle),
    frequency: mapEnumOption(plan.frequency),
    status: mapEnumOption(plan.status),
    paymentProvider: plan.paymentProvider
      ? {
          ...plan.paymentProvider,
          type:
            typeof plan.paymentProvider.type === "string"
              ? plan.paymentProvider.type
              : mapEnumOption(plan.paymentProvider.type),
        }
      : plan.paymentProvider,
    items: (plan.items ?? []).map(mapItem),
    cycles: (plan.cycles ?? []).map(mapCycle),
    events: plan.events ?? [],
  };
}
