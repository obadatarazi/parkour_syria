import type { SlidersService } from "@/features/sliders/services/sliders.service.types";
import { createApiSlidersService } from "@/features/sliders/services/sliders-api.service";

export const slidersService: SlidersService = createApiSlidersService();
