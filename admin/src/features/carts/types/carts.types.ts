export type CartConversionStatus = "ABANDONED" | "CONVERTED";

export type CartKpi = {
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  count: number;
};

export type CartStats = {
  cartsWithOrders: CartKpi;
  cartsWithNoOrders: CartKpi;
  conversionRate: CartKpi;
};

export type CartCustomer = {
  id: number;
  fullName: string | null;
  email: string | null;
  phoneNumber: string | null;
};

export type CartLine = {
  id: number;
  productId: number | null;
  productVariantId: number | null;
  productTitle: string | null;
  quantity: number;
  price: number;
  subTotalPrice: number;
  isPromotionReward: boolean;
};

export type CartOrderItem = {
  id: number;
  productId: number | null;
  productVariantId: number | null;
  productTitle: string | null;
  quantity: number;
  price: number;
  subTotalPrice: number;
  isPromotionReward: boolean;
};

export type CartOrder = {
  id: number;
  orderRefNumber: string;
  status: string;
  totalPriceWithTax: number | null;
  createdAt: string;
  items: CartOrderItem[];
};

export type AdminCart = {
  id: number;
  cartUuid: string | null;
  userId: number | null;
  guest: boolean;
  conversionStatus: CartConversionStatus;
  ordersCount: number;
  purchasedItemsCount: number;
  totalPrice: number | null;
  totalPriceWithDiscount: number | null;
  user: CartCustomer | null;
  items: CartLine[];
  orders?: CartOrder[];
  createdAt: string;
  updatedAt: string;
};

export type CartListParams = {
  page?: number;
  limit?: number;
  search?: string;
  conversionStatus?: CartConversionStatus;
  guest?: boolean;
  userId?: number;
  cartUuid?: string;
  sort?: string;
  direction?: "asc" | "desc";
};
