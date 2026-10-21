import type {
  OrderItem,
  OrderItemListParams,
  OrderItemListResult,
} from "@/features/order-items/types/order-items.types";

export interface OrderItemsService {
  list(params?: OrderItemListParams, signal?: AbortSignal): Promise<OrderItemListResult>;
  getById(id: number): Promise<OrderItem>;
}
