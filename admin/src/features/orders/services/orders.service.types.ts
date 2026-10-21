import type {
  Order,
  OrderFormData,
  OrderListParams,
  OrderListResult,
  OrderPackingSlipDownload,
  OrderStats,
} from "@/features/orders/types/orders.types";

export interface OrdersService {
  list(params?: OrderListParams, signal?: AbortSignal): Promise<OrderListResult>;
  getById(id: number): Promise<Order>;
  getByRefNumber(orderRefNumber: string, signal?: AbortSignal): Promise<Order>;
  resolveRouteKey(routeKey: string, signal?: AbortSignal): Promise<Order>;
  getStats(signal?: AbortSignal): Promise<OrderStats>;
  create(data: OrderFormData): Promise<Order>;
  update(id: number, data: Partial<OrderFormData>, original?: OrderFormData): Promise<Order>;
  downloadPackingSlip(orderRefNumber: string): Promise<OrderPackingSlipDownload>;
}
