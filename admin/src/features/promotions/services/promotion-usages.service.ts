import type { PromotionUsagesService } from "@/features/promotions/services/promotion-usages.service.types";
import { createApiPromotionUsagesService } from "@/features/promotions/services/promotion-usages-api.service";

export const promotionUsagesService: PromotionUsagesService = createApiPromotionUsagesService();
