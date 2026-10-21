import type { AdminCart, CartLine, CartOrder, CartOrderItem } from "@/features/carts/types/carts.types";

function mapLine(line: CartLine): CartLine {
  return {
    ...line,
    quantity: Number(line.quantity ?? 0),
    price: Number(line.price ?? 0),
    subTotalPrice: Number(line.subTotalPrice ?? 0),
    isPromotionReward: Boolean(line.isPromotionReward),
  };
}

function mapOrderItem(item: CartOrderItem): CartOrderItem {
  return {
    ...item,
    quantity: Number(item.quantity ?? 0),
    price: Number(item.price ?? 0),
    subTotalPrice: Number(item.subTotalPrice ?? 0),
    isPromotionReward: Boolean(item.isPromotionReward),
  };
}

function mapOrder(order: CartOrder): CartOrder {
  return {
    ...order,
    totalPriceWithTax:
      order.totalPriceWithTax == null ? null : Number(order.totalPriceWithTax),
    items: Array.isArray(order.items) ? order.items.map(mapOrderItem) : [],
  };
}

export function mapCartFromApi(cart: AdminCart): AdminCart {
  return {
    ...cart,
    guest: Boolean(cart.guest),
    ordersCount: Number(cart.ordersCount ?? 0),
    purchasedItemsCount: Number(cart.purchasedItemsCount ?? 0),
    totalPrice: cart.totalPrice == null ? null : Number(cart.totalPrice),
    totalPriceWithDiscount:
      cart.totalPriceWithDiscount == null ? null : Number(cart.totalPriceWithDiscount),
    items: Array.isArray(cart.items) ? cart.items.map(mapLine) : [],
    orders: Array.isArray(cart.orders) ? cart.orders.map(mapOrder) : cart.orders,
  };
}
