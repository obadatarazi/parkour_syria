import type { CartsService } from "@/features/carts/services/carts.service.types";
import { createApiCartsService } from "@/features/carts/services/carts-api.service";

export const cartsService: CartsService = createApiCartsService();
