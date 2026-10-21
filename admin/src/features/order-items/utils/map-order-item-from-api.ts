import type {
  OrderItem,
  OrderItemProductRef,
} from "@/features/order-items/types/order-items.types";

type ApiProductRef = {
  id?: number;
  title?: string | null;
  featuredImageUrl?: string | null;
};

type ApiOrderItem = {
  id: number;
  orderId?: number;
  order_id?: number;
  orderRefNumber?: string | null;
  productId?: number | null;
  productVariantId?: number | null;
  productTitle?: string | null;
  price?: number | string;
  quantity?: number | string;
  subTotalPrice?: number | string;
  subTotalPriceWithDiscount?: number | string | null;
  product?: ApiProductRef | null;
  createdAt?: string;
  updatedAt?: string;
};

function toNumber(value: number | string | null | undefined, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function toNullableNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = toNumber(value, Number.NaN);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapProductRef(product: ApiProductRef | null | undefined): OrderItemProductRef | null {
  if (!product?.id) return null;
  return {
    id: product.id,
    title: product.title ?? null,
    featuredImageUrl: product.featuredImageUrl ?? null,
  };
}

export function mapOrderItemFromApi(raw: ApiOrderItem): OrderItem {
  const product = mapProductRef(raw.product);
  const productId = raw.productId ?? product?.id ?? null;

  return {
    id: raw.id,
    orderId: raw.orderId ?? raw.order_id ?? 0,
    orderRefNumber: raw.orderRefNumber ?? null,
    productId,
    productVariantId: raw.productVariantId ?? null,
    productTitle: raw.productTitle ?? product?.title ?? null,
    price: toNumber(raw.price),
    quantity: Math.trunc(toNumber(raw.quantity)),
    subTotalPrice: toNumber(raw.subTotalPrice),
    subTotalPriceWithDiscount: toNullableNumber(raw.subTotalPriceWithDiscount),
    product,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}
