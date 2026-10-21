import type { BogoPromotionsService } from "@/features/promotions/services/bogo-promotions.service.types";
import { createApiBogoPromotionsService } from "@/features/promotions/services/bogo-promotions-api.service";

export const bogoPromotionsService: BogoPromotionsService = createApiBogoPromotionsService();
