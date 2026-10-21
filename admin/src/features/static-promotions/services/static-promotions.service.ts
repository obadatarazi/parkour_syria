import type { StaticPromotionsService } from "@/features/static-promotions/services/static-promotions.service.types";
import { createApiStaticPromotionsService } from "@/features/static-promotions/services/static-promotions-api.service";

export const staticPromotionsService: StaticPromotionsService =
  createApiStaticPromotionsService();
