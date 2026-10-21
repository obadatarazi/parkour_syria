export type EnumLabelValue = {
  label: string | null;
  value: string | null;
};

export type OrderUserRef = {
  id: number;
  fullName: string;
  email?: string | null;
  phoneNumber?: string | null;
  avatarFileUrl?: string | null;
};

export type OrderDeliveryZonePriceRef = {
  id: number;
  deliveryFee: number;
  state?: {
    id: number;
    title: string;
  } | null;
};

export type OrderAddress = {
  title?: string | null;
  phoneNumber?: string | null;
  streetTitle?: string | null;
  /** Address block (القطعة), optional. */
  block?: string | null;
  building?: string | null;
  floorNumber?: string | null;
  apartment?: string | null;
  landmark?: string | null;
  longitude?: string | number | null;
  latitude?: string | number | null;
};

export type OrderItem = {
  id: number;
  orderId?: number;
  orderRefNumber?: string | null;
  productId?: number | null;
  productVariantId?: number | null;
  productTitle?: string | null;
  price: number;
  quantity: number;
  subTotalPrice: number;
  subTotalPriceWithDiscount?: number | null;
};

export type OrderInvoicePaymentProviderRef = {
  id: number;
  title?: string;
  standard?: boolean;
  imageFileUrl?: string | null;
  type?: EnumLabelValue | null;
};

export type OrderPackingSlipDownload = {
  fileName: string;
  fileUrl: string;
  downloadUrl: string;
};

/** GET /admin/orders/stats — sidebar badge and list chrome KPIs. */
export type OrderStats = {
  needsActionCount: number;
};

export type OrderInvoice = {
  id?: number;
  invoiceNumber?: string | null;
  orderId?: number;
  orderRefNumber?: string | null;
  paymentProviderId?: number | null;
  currencyId?: number | null;
  currencyCode?: string | null;
  currency?: {
    id: number;
    title: string;
    symbol: string;
  } | null;
  status?: EnumLabelValue | null;
  paymentProviderType?: EnumLabelValue | null;
  /** Slim order list may send a single locale title instead of nested provider. */
  paymentProviderTitle?: string | null;
  paymentProvider?: OrderInvoicePaymentProviderRef | null;
  totalPrice?: number;
  paymentMethod?: string | null;
  paidAt?: string | null;
  providerInvoiceId?: string | null;
  paymentUrl?: string | null;
};

/** Snapshot of a coupon applied when the order was placed (GOODS vs SHIPPING). */
export type OrderCouponDiscount = {
  code: string | null;
  discount: number;
  target: "GOODS" | "SHIPPING" | string | null;
};

export type OrderLoyaltyRewardRef = {
  id: number;
  code?: string | null;
  name?: string | null;
  type?: EnumLabelValue | null;
  pointsCost?: number | null;
  rewardValue?: string | number | null;
};

export type OrderLoyaltyRedemptionRef = {
  id: number;
  points?: number | null;
  status?: EnumLabelValue | null;
  loyaltyReward?: OrderLoyaltyRewardRef | null;
};

/**
 * Order list rows are slim (summary fields + itemsCount). Details fields
 * (items, address, deliveryZonePrice, deliveryFeePrice, …) arrive only from getById.
 */
export type Order = {
  id: number;
  orderRefNumber: string;
  orderUuid?: string;
  user?: OrderUserRef | null;
  userAddressId?: number | null;
  deliveryZonePrice?: OrderDeliveryZonePriceRef | null;
  fullName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  address?: OrderAddress | null;
  /** Free-text note from the customer or the admin who took the order. Printed on the invoice. */
  note?: string | null;
  /** Details-only — absent on slim list rows. */
  deliveryFeePrice?: number;
  commissionTaxRate?: string | null;
  commissionTaxPrice?: number | null;
  totalPrice: number;
  totalPriceWithDiscount?: number | null;
  totalPriceWithTax?: number | null;
  hasDiscount?: boolean;
  /** Codes applied at checkout (list + details). */
  couponCodes?: string[];
  /** Per-code discount snapshot (list + details). */
  couponDiscounts?: OrderCouponDiscount[];
  loyaltyRedemptionId?: number | null;
  loyaltyDiscountPrice?: number | null;
  loyaltyRedemption?: OrderLoyaltyRedemptionRef | null;
  status?: EnumLabelValue | null;
  createdBy?: EnumLabelValue | null;
  /** Channel the order came from (website checkout vs WhatsApp, etc.). */
  source?: EnumLabelValue | null;
  createdByAdmin?: OrderUserRef | null;
  itemsCount?: number;
  /** Details-only — use itemsCount on list. */
  items?: OrderItem[];
  invoice?: OrderInvoice | null;
  createdAt?: string;
  updatedAt?: string;
};

export type OrderListParams = {
  page?: number;
  limit?: number;
  search?: string;
  userId?: number;
  orderRefNumber?: string;
  status?: string;
  createdBy?: string;
  source?: string;
  hasDiscount?: boolean;
  invoiceStatus?: string;
  paymentProvider?: string;
  sort?: string;
  direction?: "asc" | "desc";
};

export type OrderLineItemFormData = {
  key: string;
  productId: number | null;
  productVariantId: number | null;
  quantity: number;
};

export type OrderFormData = {
  userId: number | null;
  userAddressId: number | null;
  deliveryZonePriceId: number | null;
  /**
   * Optional per-order shipping fee override (`deliveryFeePrice`).
   * `null` omits the key so create uses the zone fee and update keeps the fee already on the order
   * (or the new zone fee when the zone changes). `0` is free delivery for this order.
   */
  deliveryFeePrice: number | null;
  fullName: string;
  email: string;
  phoneNumber: string;
  addressTitle: string;
  addressPhoneNumber: string;
  addressStreetTitle: string;
  addressBlock: string;
  addressBuilding: string;
  addressFloorNumber: string;
  addressApartment: string;
  addressLandmark: string;
  addressLongitude: string;
  addressLatitude: string;
  /** Optional order note (max 1000). Empty string means no note / clear on update. */
  note: string;
  currencyId: number | null;
  status?: string;
  /** Required on create — WEBSITE | WHATSAPP. */
  source?: string;
  /** Coupon codes applied when the order is created. */
  couponCodes: string[];
  items: OrderLineItemFormData[];
};

/** Final amount due: goods (+ tax when charged) + delivery, when the API computed it. */
export function getOrderAmountDue(order: Pick<
  Order,
  "totalPrice" | "totalPriceWithDiscount" | "totalPriceWithTax"
>): number {
  if (order.totalPriceWithTax != null && Number.isFinite(order.totalPriceWithTax)) {
    return order.totalPriceWithTax;
  }
  if (order.totalPriceWithDiscount != null && Number.isFinite(order.totalPriceWithDiscount)) {
    return order.totalPriceWithDiscount;
  }
  return order.totalPrice;
}

export type OrderListResult = import("@/shared/types").PaginatedResult<Order>;

let lineItemKey = 0;

export function createEmptyOrderLineItem(): OrderLineItemFormData {
  lineItemKey += 1;
  return {
    key: `line-${lineItemKey}`,
    productId: null,
    productVariantId: null,
    quantity: 1,
  };
}

export function createEmptyOrderForm(): OrderFormData {
  return {
    userId: null,
    userAddressId: null,
    deliveryZonePriceId: null,
    deliveryFeePrice: null,
    fullName: "",
    email: "",
    phoneNumber: "",
    addressTitle: "",
    addressPhoneNumber: "",
    addressStreetTitle: "",
    addressBlock: "",
    addressBuilding: "",
    addressFloorNumber: "",
    addressApartment: "",
    addressLandmark: "",
    addressLongitude: "",
    addressLatitude: "",
    note: "",
    currencyId: null,
    status: undefined,
    source: "WEBSITE",
    couponCodes: [],
    items: [createEmptyOrderLineItem()],
  };
}

export function orderToFormData(order: Order): OrderFormData {
  return {
    userId: order.user?.id ?? null,
    userAddressId: order.userAddressId ?? null,
    deliveryZonePriceId: order.deliveryZonePrice?.id ?? null,
    // Leave empty on hydrate so an untouched edit does not resend the fee; the field is an
    // explicit override. The view already shows the fee charged on the order.
    deliveryFeePrice: null,
    fullName: order.fullName ?? "",
    email: order.email ?? "",
    phoneNumber: order.phoneNumber ?? "",
    addressTitle: order.address?.title ?? "",
    addressPhoneNumber: order.address?.phoneNumber ?? "",
    addressStreetTitle: order.address?.streetTitle ?? "",
    addressBlock: order.address?.block ?? "",
    addressBuilding: order.address?.building ?? "",
    addressFloorNumber: order.address?.floorNumber ?? "",
    addressApartment: order.address?.apartment ?? "",
    addressLandmark: order.address?.landmark ?? "",
    addressLongitude:
      order.address?.longitude == null ? "" : String(order.address.longitude),
    addressLatitude:
      order.address?.latitude == null ? "" : String(order.address.latitude),
    note: order.note ?? "",
    currencyId: order.invoice?.currencyId ?? null,
    status: order.status?.value ?? undefined,
    source: order.source?.value ?? undefined,
    couponCodes: (order.couponCodes ?? [])
      .map((code) => code.trim().toUpperCase())
      .filter(Boolean),
    items:
      order.items && order.items.length > 0
        ? order.items.map((item) => {
            lineItemKey += 1;
            return {
              key: `line-${lineItemKey}`,
              productId: item.productId ?? null,
              productVariantId: item.productVariantId ?? null,
              quantity: item.quantity,
            };
          })
        : [createEmptyOrderLineItem()],
  };
}

function optionalTrimmed(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

export function buildOrderCreatePayload(data: OrderFormData): Record<string, unknown> {
  const items = data.items
    .map((item) => {
      if (item.productVariantId) {
        return {
          productVariantId: item.productVariantId,
          quantity: item.quantity,
        };
      }
      if (item.productId) {
        return {
          productId: item.productId,
          quantity: item.quantity,
        };
      }
      return null;
    })
    .filter((item): item is NonNullable<typeof item> => item != null);

  const note = optionalTrimmed(data.note);

  return {
    deliveryZonePriceId: data.deliveryZonePriceId,
    userId: data.userId ?? undefined,
    userAddressId: data.userAddressId ?? undefined,
    fullName: optionalTrimmed(data.fullName),
    email: optionalTrimmed(data.email),
    phoneNumber: optionalTrimmed(data.phoneNumber),
    addressTitle: optionalTrimmed(data.addressTitle),
    addressPhoneNumber: optionalTrimmed(data.addressPhoneNumber),
    addressStreetTitle: optionalTrimmed(data.addressStreetTitle),
    addressBlock: optionalTrimmed(data.addressBlock),
    addressBuilding: optionalTrimmed(data.addressBuilding),
    addressFloorNumber: optionalTrimmed(data.addressFloorNumber),
    addressApartment: optionalTrimmed(data.addressApartment),
    addressLandmark: optionalTrimmed(data.addressLandmark),
    addressLongitude: optionalTrimmed(data.addressLongitude),
    addressLatitude: optionalTrimmed(data.addressLatitude),
    currencyId: data.currencyId ?? undefined,
    ...(note ? { note } : {}),
    source: data.source,
    items,
    ...(data.deliveryFeePrice != null
      ? { deliveryFeePrice: data.deliveryFeePrice }
      : {}),
    ...(data.couponCodes.length > 0
      ? {
          // Backend OrderRequest (since 18f3fc6) validates coupon_codes on store; CustomFormRequest
          // snake_cases this key before validated() reaches OrderService::applyCoupons().
          couponCodes: data.couponCodes
            .map((code) => code.trim().toUpperCase())
            .filter(Boolean),
        }
      : {}),
  };
}

export function buildOrderUpdatePayload(
  original: OrderFormData,
  current: OrderFormData,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  if (current.status && current.status !== original.status) {
    payload.status = current.status;
  }

  if (current.source && current.source !== original.source) {
    payload.source = current.source;
  }

  const scalarKeys = [
    "fullName",
    "email",
    "phoneNumber",
    "addressTitle",
    "addressPhoneNumber",
    "addressStreetTitle",
    "addressBlock",
    "addressBuilding",
    "addressFloorNumber",
    "addressApartment",
    "addressLandmark",
    "addressLongitude",
    "addressLatitude",
    "note",
  ] as const;

  for (const key of scalarKeys) {
    if (current[key].trim() !== original[key].trim()) {
      payload[key] = optionalTrimmed(current[key]) ?? null;
    }
  }

  if (current.deliveryZonePriceId !== original.deliveryZonePriceId) {
    payload.deliveryZonePriceId = current.deliveryZonePriceId;
  }
  // Explicit override only — empty field means keep the fee already on the order (or the zone
  // fee when the zone was changed above).
  if (current.deliveryFeePrice != null && current.deliveryFeePrice !== original.deliveryFeePrice) {
    payload.deliveryFeePrice = current.deliveryFeePrice;
  }
  if (current.userId !== original.userId) {
    payload.userId = current.userId;
  }
  if (current.userAddressId !== original.userAddressId) {
    payload.userAddressId = current.userAddressId;
  }
  if (current.currencyId !== original.currencyId) {
    payload.currencyId = current.currencyId;
  }

  const itemsChanged =
    current.items.length !== original.items.length ||
    current.items.some((item, index) => {
      const prev = original.items[index];
      return (
        !prev ||
        item.productId !== prev.productId ||
        item.productVariantId !== prev.productVariantId ||
        item.quantity !== prev.quantity
      );
    });

  if (itemsChanged) {
    payload.items = buildOrderCreatePayload(current).items;
  }

  return payload;
}

export function hasOrderFormChanges(original: OrderFormData, current: OrderFormData): boolean {
  return Object.keys(buildOrderUpdatePayload(original, current)).length > 0;
}
