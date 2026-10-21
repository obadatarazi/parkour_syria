import type { SliderPromotionsService } from "@/features/slider-promotions/services/slider-promotions.service.types";
import { createApiSliderPromotionsService } from "@/features/slider-promotions/services/slider-promotions-api.service";

export const sliderPromotionsService: SliderPromotionsService =
  createApiSliderPromotionsService();
