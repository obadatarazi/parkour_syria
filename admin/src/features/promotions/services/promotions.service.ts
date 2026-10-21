import type { PromotionsService } from "@/features/promotions/services/promotions.service.types";
import { createApiPromotionsService } from "@/features/promotions/services/promotions-api.service";

export const promotionsService: PromotionsService = createApiPromotionsService();
