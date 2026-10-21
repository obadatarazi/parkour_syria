import type { OrdersService } from "@/features/orders/services/orders.service.types";
import { createApiOrdersService } from "@/features/orders/services/orders-api.service";

export const ordersService: OrdersService = createApiOrdersService();
