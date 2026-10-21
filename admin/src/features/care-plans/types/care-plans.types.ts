import { hasFormChanges, pickChangedScalar } from "@/shared/lib/form/pick-changed-fields";
import type { PaginatedResult } from "@/shared/types";

export type CarePlanEnumOption = {
  label: string;
  value: string;
};

export type CarePlanStatusValue = "ACTIVE" | "PAUSED" | "CANCELLED";
export type CarePlanFrequencyValue = "WEEKLY" | "BIWEEKLY" | "MONTHLY";

export type CarePlanUserRef = {
  id: number;
  fullName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
};

export type CarePlanAddressRef = {
  id: number;
  title?: string | null;
  phoneNumber?: string | null;
};

export type CarePlanDeliveryZoneRef = {
  id: number;
  deliveryFee?: number | null;
  state?: { id: number; title?: string | null } | null;
};

export type CarePlanPaymentProviderRef = {
  id: number;
  title?: string | null;
  type?: string | CarePlanEnumOption | null;
};

export type CarePlanItemVariation = {
  attributeId?: number | null;
  attribute?: string | null;
  valueId?: number | null;
  value?: string | null;
};

export type CarePlanItem = {
  id?: number;
  carePlanId?: number;
  productId: number;
  productVariantId?: number | null;
  quantity: number;
  sortOrder?: number;
  title?: string | null;
  skuCode?: string | null;
  variantLabel?: string | null;
  variations?: CarePlanItemVariation[];
  product?: { id: number; title?: string | null } | null;
  productVariant?: { id: number; sku?: string | null; skuCode?: string | null } | null;
};

export type CarePlanCycle = {
  id: number;
  carePlanId?: number;
  cycleNumber: number;
  scheduledFor?: string | null;
  cutoffAt?: string | null;
  paymentClosesAt?: string | null;
  status?: CarePlanEnumOption | null;
  frozenDiscountPercent?: number | null;
  orderId?: number | null;
  orderUuid?: string | null;
  orderRefNumber?: string | null;
  paymentUrl?: string | null;
  skipReason?: string | null;
  failedReason?: string | null;
  processedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CarePlanCycleTotals = {
  discountPercent: number;
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  taxAmount: number;
  total: number;
};

export type CarePlanUpcomingCycle = {
  cycleId?: number | null;
  cycleNumber: number;
  scheduledFor?: string | null;
  cutoffAt?: string | null;
  paymentClosesAt?: string | null;
  status?: CarePlanEnumOption | null;
  isPreview: boolean;
  isCurrent: boolean;
  discountPercent: number;
  estimatedTotal: number;
  orderRefNumber?: string | null;
  paymentUrl?: string | null;
};

export type CarePlanEvent = {
  id: number;
  carePlanId?: number;
  carePlanCycleId?: number | null;
  actorUserId?: number | null;
  type?: string | null;
  reason?: string | null;
  payload?: unknown;
  createdAt?: string;
};

export type CarePlan = {
  id: number;
  userId: number;
  user?: CarePlanUserRef | null;
  userAddressId: number;
  userAddress?: CarePlanAddressRef | null;
  deliveryZonePriceId?: number | null;
  deliveryZonePrice?: CarePlanDeliveryZoneRef | null;
  paymentProviderId: number;
  paymentProvider?: CarePlanPaymentProviderRef | null;
  frequency?: CarePlanEnumOption | null;
  status?: CarePlanEnumOption | null;
  preferredWeekday?: number | null;
  initialDiscountPercent: number;
  loyaltyDiscountPercent: number;
  completedCyclesCount: number;
  currentDiscountPercent: number;
  missedPaymentCount: number;
  nextDeliveryAt?: string | null;
  nextCycleTotals?: CarePlanCycleTotals | null;
  upcomingCycles?: CarePlanUpcomingCycle[];
  itemsCount?: number | null;
  items?: CarePlanItem[];
  cycles?: CarePlanCycle[];
  events?: CarePlanEvent[];
  pausedAt?: string | null;
  cancelAt?: string | null;
  startedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CarePlanListParams = {
  page?: number;
  limit?: number;
  search?: string;
  userId?: number;
  status?: string;
  frequency?: string;
  paymentProviderId?: number;
  sort?: string;
  direction?: "asc" | "desc";
};

export type CarePlanItemFormData = {
  key: string;
  productId: number | null;
  productVariantId: number | null;
  quantity: number;
  sortOrder: number;
};

export type CarePlanFormData = {
  userId: number | null;
  userAddressId: number | null;
  deliveryZonePriceId: number | null;
  paymentProviderId: number | null;
  frequency: CarePlanFrequencyValue | "";
  preferredWeekday: number | null;
  items: CarePlanItemFormData[];
};

export type CarePlanListResult = PaginatedResult<CarePlan>;

export type CarePlanOutOfStockWidgetItem = {
  carePlanId: number;
  userId?: number | null;
  customerName?: string | null;
  productId: number;
  productVariantId?: number | null;
  productTitle?: string | null;
  variantLabel?: string | null;
  requiredQuantity: number;
  availableStock: number;
};

export type CarePlanTopProductWidgetItem = {
  productId: number;
  productVariantId?: number | null;
  productTitle?: string | null;
  variantLabel?: string | null;
  subscriptionsCount: number;
  totalQuantity: number;
};

export type CarePlanAwaitingPaymentWidgetItem = {
  carePlanCycleId: number;
  carePlanId: number;
  userId?: number | null;
  customerName?: string | null;
  customerEmail?: string | null;
  preferredWeekday?: number | null;
  weekdayLabel?: string | null;
  scheduledFor?: string | null;
  cutoffAt?: string | null;
  frozenDiscountPercent?: number | null;
};

export type CarePlanWidgetsSnapshot = {
  outOfStock: CarePlanOutOfStockWidgetItem[];
  topProducts: CarePlanTopProductWidgetItem[];
  awaitingPayment: CarePlanAwaitingPaymentWidgetItem[];
};

let itemKeyCounter = 0;

export function createCarePlanItemKey(): string {
  itemKeyCounter += 1;
  return `care-plan-item-${itemKeyCounter}`;
}

export function createEmptyCarePlanItem(sortOrder = 0): CarePlanItemFormData {
  return {
    key: createCarePlanItemKey(),
    productId: null,
    productVariantId: null,
    quantity: 1,
    sortOrder,
  };
}

export function createEmptyCarePlanForm(): CarePlanFormData {
  return {
    userId: null,
    userAddressId: null,
    deliveryZonePriceId: null,
    paymentProviderId: null,
    frequency: "MONTHLY",
    preferredWeekday: null,
    items: [createEmptyCarePlanItem(0)],
  };
}

export function carePlanToFormData(plan: CarePlan): CarePlanFormData {
  const frequencyValue = plan.frequency?.value;
  const frequency: CarePlanFrequencyValue | "" =
    frequencyValue === "WEEKLY" ||
    frequencyValue === "BIWEEKLY" ||
    frequencyValue === "MONTHLY"
      ? frequencyValue
      : "";

  const items =
    plan.items && plan.items.length > 0
      ? plan.items.map((item, index) => ({
          key: createCarePlanItemKey(),
          productId: item.productId,
          productVariantId: item.productVariantId ?? null,
          quantity: item.quantity,
          sortOrder: item.sortOrder ?? index,
        }))
      : [createEmptyCarePlanItem(0)];

  return {
    userId: plan.userId,
    userAddressId: plan.userAddressId,
    deliveryZonePriceId: plan.deliveryZonePriceId ?? null,
    paymentProviderId: plan.paymentProviderId,
    frequency,
    preferredWeekday: plan.preferredWeekday ?? null,
    items,
  };
}

function areItemsEqual(a: CarePlanItemFormData[], b: CarePlanItemFormData[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((row, index) => {
    const other = b[index];
    return (
      row.productId === other.productId &&
      row.productVariantId === other.productVariantId &&
      Number(row.quantity) === Number(other.quantity) &&
      Number(row.sortOrder) === Number(other.sortOrder)
    );
  });
}

export function pickCarePlanFormChanges(
  original: CarePlanFormData,
  current: CarePlanFormData,
): Partial<CarePlanFormData> {
  const changes: Partial<CarePlanFormData> = {
    ...pickChangedScalar(original, current, [
      "userAddressId",
      "deliveryZonePriceId",
      "paymentProviderId",
      "frequency",
      "preferredWeekday",
    ]),
  };

  if (!areItemsEqual(original.items, current.items)) {
    changes.items = current.items;
  }

  return changes;
}

export function hasCarePlanFormChanges(
  original: CarePlanFormData,
  current: CarePlanFormData,
): boolean {
  return hasFormChanges(pickCarePlanFormChanges(original, current));
}

export function getCarePlanCustomerLabel(plan: CarePlan, fallback = "—"): string {
  return (
    plan.user?.fullName?.trim() ||
    plan.user?.email?.trim() ||
    plan.user?.phoneNumber?.trim() ||
    (plan.userId ? `#${plan.userId}` : fallback)
  );
}
