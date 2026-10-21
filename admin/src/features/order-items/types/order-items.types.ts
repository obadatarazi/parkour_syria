import type { PaginatedResult } from "@/shared/types";

/** Slim product snapshot nested on an order line (list/details). */
export type OrderItemProductRef = {
  id: number;
  title?: string | null;
  featuredImageUrl?: string | null;
};

export type OrderItem = {
  id: number;
  orderId: number;
  orderRefNumber?: string | null;
  productId?: number | null;
  productVariantId?: number | null;
  productTitle?: string | null;
  price: number;
  quantity: number;
  subTotalPrice: number;
  subTotalPriceWithDiscount?: number | null;
  product?: OrderItemProductRef | null;
  createdAt?: string;
  updatedAt?: string;
};

export type OrderItemListParams = {
  page?: number;
  limit?: number;
  search?: string;
  orderId?: number;
  orderRefNumber?: string;
  productId?: number;
  productVariantId?: number;
  productTitle?: string;
  minQuantity?: number;
  maxQuantity?: number;
  sort?: string;
  direction?: "asc" | "desc";
};

export type OrderItemListResult = PaginatedResult<OrderItem>;
