import type {
  CrmAddressSlice,
  CrmCarePlanSummary,
  CrmCouponSlice,
  CrmCustomer,
  CrmLabelValue,
  CrmLoyalty,
  CrmOrderSlice,
  CrmPaymentSlice,
  CrmPrescriptionSlice,
  CrmReviewSlice,
  CrmStaffNote,
  CrmTimelineEvent,
} from "@/features/customers/types/customers.types";

function mapLabelValue(raw: unknown): CrmLabelValue {
  if (raw && typeof raw === "object" && "value" in raw) {
    const obj = raw as { label?: string; value?: string };
    return {
      label: obj.label ?? String(obj.value ?? ""),
      value: String(obj.value ?? ""),
    };
  }
  return { label: String(raw ?? ""), value: String(raw ?? "") };
}

function mapLoyalty(raw: unknown): CrmLoyalty {
  const obj = (raw ?? {}) as Record<string, unknown>;
  return {
    pointsBalance: Number(obj.pointsBalance ?? 0),
    lifetimeEarned: Number(obj.lifetimeEarned ?? 0),
    lifetimeRedeemed: Number(obj.lifetimeRedeemed ?? 0),
  };
}

function mapCarePlan(raw: unknown): CrmCarePlanSummary | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  return {
    id: Number(obj.id),
    status: mapLabelValue(obj.status),
    frequency: String(obj.frequency ?? ""),
    nextDeliveryAt: (obj.nextDeliveryAt as string | null) ?? null,
  };
}

export function mapOrdersFromApi(raw: unknown): CrmOrderSlice[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const obj = item as Record<string, unknown>;
    return {
      id: Number(obj.id),
      orderRefNumber: String(obj.orderRefNumber ?? ""),
      placedAt: String(obj.placedAt ?? ""),
      total: Number(obj.total ?? 0),
      status: mapLabelValue(obj.status),
      items: Number(obj.items ?? 0),
      paymentMethod: (obj.paymentMethod as string | null) ?? null,
    };
  });
}

export function mapPaymentsFromApi(raw: unknown): CrmPaymentSlice[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const obj = item as Record<string, unknown>;
    return {
      id: Number(obj.id),
      orderId: Number(obj.orderId),
      amount: Number(obj.amount ?? 0),
      method: (obj.method as string | null) ?? null,
      status: mapLabelValue(obj.status),
      paidAt: (obj.paidAt as string | null) ?? null,
    };
  });
}

function mapReviews(raw: unknown): CrmReviewSlice[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const obj = item as Record<string, unknown>;
    return {
      id: Number(obj.id),
      productTitle: (obj.productTitle as string | null) ?? null,
      rating: Number(obj.rating ?? 0),
      body: (obj.body as string | null) ?? null,
      status: mapLabelValue(obj.status),
      createdAt: (obj.createdAt as string | null) ?? null,
    };
  });
}

function mapCoupons(raw: unknown): CrmCouponSlice[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const obj = item as Record<string, unknown>;
    return {
      code: (obj.code as string | null) ?? null,
      title: (obj.title as string | null) ?? null,
      valueLabel: (obj.valueLabel as string | null) ?? null,
      status: mapLabelValue(obj.status),
      orderId: obj.orderId != null ? Number(obj.orderId) : null,
      usedAt: (obj.usedAt as string | null) ?? null,
      assignedAt: (obj.assignedAt as string | null) ?? null,
    };
  });
}

function mapAddresses(raw: unknown): CrmAddressSlice[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const obj = item as Record<string, unknown>;
    return {
      id: Number(obj.id),
      title: (obj.title as string | null) ?? null,
      line: String(obj.line ?? ""),
      phone: (obj.phone as string | null) ?? null,
      isDefault: Boolean(obj.isDefault),
    };
  });
}

function mapPrescriptions(raw: unknown): CrmPrescriptionSlice[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const obj = item as Record<string, unknown>;
    const products = Array.isArray(obj.products)
      ? obj.products.map((p) => ({
          title: (p as { title?: string }).title ?? null,
        }))
      : [];
    return {
      id: Number(obj.id),
      prescriptionNumber: String(obj.prescriptionNumber ?? ""),
      status: mapLabelValue(obj.status),
      fileUrl: (obj.fileUrl as string | null) ?? null,
      productsCount: Number(obj.productsCount ?? products.length),
      products,
      createdAt: (obj.createdAt as string | null) ?? null,
    };
  });
}

export function mapStaffNoteFromApi(raw: unknown): CrmStaffNote {
  const obj = (raw ?? {}) as Record<string, unknown>;
  const authorRaw = obj.author as Record<string, unknown> | null;
  return {
    id: Number(obj.id),
    author: authorRaw
      ? {
          id: Number(authorRaw.id),
          fullName: String(authorRaw.fullName ?? ""),
        }
      : null,
    type: mapLabelValue(obj.type) as CrmStaffNote["type"],
    body: String(obj.body ?? ""),
    createdAt: (obj.createdAt as string | null) ?? null,
    updatedAt: (obj.updatedAt as string | null) ?? null,
  };
}

function mapTimeline(raw: unknown): CrmTimelineEvent[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const obj = item as Record<string, unknown>;
    return {
      id: Number(obj.id),
      type: String(obj.type ?? "registered") as CrmTimelineEvent["type"],
      title: String(obj.title ?? ""),
      at: (obj.at as string | null) ?? null,
    };
  });
}

export function mapCustomerFromApi(raw: unknown): CrmCustomer {
  const obj = (raw ?? {}) as Record<string, unknown>;
  const tags = Array.isArray(obj.tags) ? (obj.tags as CrmCustomer["tags"]) : [];

  return {
    id: Number(obj.id),
    fullName: String(obj.fullName ?? ""),
    email: (obj.email as string | null) ?? null,
    phoneNumber: (obj.phoneNumber as string | null) ?? null,
    whatsappPhoneNumber: (obj.whatsappPhoneNumber as string | null) ?? null,
    whatsappNotificationsEnabled: Boolean(obj.whatsappNotificationsEnabled),
    avatarFileUrl: (obj.avatarFileUrl as string | null) ?? null,
    active: Boolean(obj.active),
    isVip: Boolean(obj.isVip),
    cookiesAccepted: Boolean(obj.cookiesAccepted),
    cookiesAcceptedAt: (obj.cookiesAcceptedAt as string | null) ?? null,
    joinedAt: (obj.joinedAt as string | null) ?? null,
    lastOrderAt: (obj.lastOrderAt as string | null) ?? null,
    ordersCount: Number(obj.ordersCount ?? 0),
    spent: Number(obj.spent ?? 0),
    ordersTotal: obj.ordersTotal != null ? Number(obj.ordersTotal) : undefined,
    paymentsTotal: obj.paymentsTotal != null ? Number(obj.paymentsTotal) : undefined,
    tags,
    loyalty: mapLoyalty(obj.loyalty),
    carePlan: mapCarePlan(obj.carePlan),
    orders: mapOrdersFromApi(obj.orders),
    payments: mapPaymentsFromApi(obj.payments),
    reviews: mapReviews(obj.reviews),
    coupons: mapCoupons(obj.coupons),
    addresses: mapAddresses(obj.addresses),
    prescriptions: mapPrescriptions(obj.prescriptions),
    staffNotes: Array.isArray(obj.staffNotes)
      ? obj.staffNotes.map(mapStaffNoteFromApi)
      : undefined,
    timeline: mapTimeline(obj.timeline),
  };
}
