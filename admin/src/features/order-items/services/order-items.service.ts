import type { OrderItemsService } from "@/features/order-items/services/order-items.service.types";
import { createApiOrderItemsService } from "@/features/order-items/services/order-items-api.service";

export const orderItemsService: OrderItemsService = createApiOrderItemsService();
