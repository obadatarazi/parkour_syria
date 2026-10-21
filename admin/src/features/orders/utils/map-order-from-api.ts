import type {
  Order,
  OrderCouponDiscount,
  OrderInvoice,
  OrderInvoicePaymentProviderRef,
  OrderLoyaltyRedemptionRef,
} from "@/features/orders/types/orders.types";
import {
  resolveStaticEnumLabel,
  type StaticEnumLocale,
} from "@/shared/constants/static-enum-options";
import { type EnumLabelValue,normalizeEnumLabelValue } from "@/shared/lib/api/normalize-enum.utils";
import { getTitleFromApiTranslations } from "@/shared/lib/api/normalize-translations.utils";

type RawOrderInvoice = Omit<
  OrderInvoice,
  "status" | "paymentProviderType" | "paymentProvider" | "currency"
> & {
  status?: string | OrderInvoice["status"];
  paymentProviderType?: string | OrderInvoice["paymentProviderType"];
  paymentProviderTitle?: string | null;
  paymentProvider?:
    | (OrderInvoicePaymentProviderRef & {
        translations?: unknown;
      })
    | null;
  currency?: {
    id?: number;
    code?: string | null;
    currencyCode?: string | null;
    title?: string;
    symbol?: string;
    translations?: unknown;
  } | null;
};

type RawOrder = Omit<Order, "status" | "createdBy" | "source" | "invoice" | "hasDiscount"> & {
  status?: string | Order["status"];
  createdBy?: string | Order["createdBy"];
  source?: string | Order["source"];
  hasDiscount?: boolean;
  couponCodes?: unknown;
  couponDiscounts?: unknown;
  loyaltyRedemptionId?: unknown;
  loyaltyDiscountPrice?: unknown;
  loyaltyRedemption?: unknown;
  invoice?: RawOrderInvoice | null;
};

function mapLoyaltyRedemption(value: unknown): OrderLoyaltyRedemptionRef | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const id = Number(row.id);
  if (!Number.isFinite(id) || id <= 0) return null;

  const rewardRaw = row.loyaltyReward;
  let loyaltyReward: OrderLoyaltyRedemptionRef["loyaltyReward"] = null;
  if (rewardRaw && typeof rewardRaw === "object") {
    const reward = rewardRaw as Record<string, unknown>;
    loyaltyReward = {
      id: Number(reward.id),
      code: typeof reward.code === "string" ? reward.code : null,
      name: typeof reward.name === "string" ? reward.name : null,
      type: normalizeEnumLabelValue(reward.type as string | EnumLabelValue | null | undefined),
      pointsCost:
        reward.pointsCost == null ? null : Number(reward.pointsCost),
      rewardValue:
        reward.rewardValue == null
          ? null
          : typeof reward.rewardValue === "number"
            ? reward.rewardValue
            : String(reward.rewardValue),
    };
  }

  return {
    id,
    points: row.points == null ? null : Number(row.points),
    status: normalizeEnumLabelValue(row.status as string | EnumLabelValue | null | undefined),
    loyaltyReward,
  };
}

function mapCouponCodes(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((code) => (typeof code === "string" ? code.trim() : ""))
    .filter((code) => code.length > 0);
}

function mapCouponDiscounts(value: unknown): OrderCouponDiscount[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((row): OrderCouponDiscount | null => {
      if (!row || typeof row !== "object") return null;
      const record = row as Record<string, unknown>;
      const code = typeof record.code === "string" ? record.code : null;
      const discount = Number(record.discount);
      const target =
        typeof record.target === "string"
          ? record.target
          : record.target == null
            ? null
            : String(record.target);
      return {
        code,
        discount: Number.isFinite(discount) ? discount : 0,
        target,
      };
    })
    .filter((row): row is OrderCouponDiscount => row != null);
}

function mapPaymentProvider(
  provider: RawOrderInvoice["paymentProvider"],
  titleFallback?: string | null,
): OrderInvoicePaymentProviderRef | null {
  if (!provider && !titleFallback) return null;
  if (!provider) {
    return { id: 0, title: titleFallback ?? undefined };
  }

  const title =
    provider.title?.trim() ||
    getTitleFromApiTranslations(provider.translations, titleFallback ?? "") ||
    titleFallback ||
    undefined;

  return {
    id: provider.id,
    title,
    standard: provider.standard,
    imageFileUrl: provider.imageFileUrl,
    type: provider.type ? normalizeEnumLabelValue(provider.type) : null,
  };
}

function mapInvoice(invoice: RawOrderInvoice | null | undefined): OrderInvoice | null {
  if (!invoice) return null;

  const paymentProviderType = normalizeEnumLabelValue(invoice.paymentProviderType);
  const paymentProvider = mapPaymentProvider(
    invoice.paymentProvider,
    invoice.paymentProviderTitle,
  );

  const currencyCode =
    invoice.currencyCode ?? invoice.currency?.code ?? invoice.currency?.currencyCode ?? null;
  const currencyTitle =
    invoice.currency?.title?.trim() ||
    getTitleFromApiTranslations(invoice.currency?.translations, "") ||
    currencyCode ||
    "";

  return {
    ...invoice,
    totalPrice: invoice.totalPrice ?? 0,
    status: normalizeEnumLabelValue(invoice.status),
    paymentProviderType,
    paymentProvider,
    currencyCode,
    currency: invoice.currency
      ? {
          id: invoice.currency.id ?? 0,
          title: currencyTitle,
          symbol: invoice.currency.symbol ?? "",
        }
      : null,
  };
}

/** Normalizes Order list (slim strings) and Details (enum objects) into Admin UI shape. */
export function mapOrderFromApi(order: RawOrder): Order {
  return {
    ...order,
    hasDiscount: order.hasDiscount ?? false,
    couponCodes: mapCouponCodes(order.couponCodes),
    couponDiscounts: mapCouponDiscounts(order.couponDiscounts),
    loyaltyRedemptionId:
      order.loyaltyRedemptionId == null ? null : Number(order.loyaltyRedemptionId),
    loyaltyDiscountPrice:
      order.loyaltyDiscountPrice == null ? null : Number(order.loyaltyDiscountPrice),
    loyaltyRedemption: mapLoyaltyRedemption(order.loyaltyRedemption),
    status: normalizeEnumLabelValue(order.status),
    createdBy: normalizeEnumLabelValue(order.createdBy),
    source: normalizeEnumLabelValue(order.source),
    invoice: mapInvoice(order.invoice),
    note:
      typeof order.note === "string"
        ? order.note.trim()
          ? order.note
          : null
        : (order.note ?? null),
  };
}

export function getOrderPaymentLabel(
  order: Order,
  locale: StaticEnumLocale = "en",
): string | null {
  const title = order.invoice?.paymentProvider?.title?.trim() || null;
  if (title) return title;

  return resolveStaticEnumLabel(
    "invoicePaymentProvider",
    order.invoice?.paymentProviderType?.value,
    locale,
    order.invoice?.paymentProviderType?.label,
  );
}
