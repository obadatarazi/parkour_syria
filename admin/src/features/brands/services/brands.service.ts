import type { BrandsService } from "@/features/brands/services/brands.service.types";
import { createApiBrandsService } from "@/features/brands/services/brands-api.service";

export const brandsService: BrandsService = createApiBrandsService();
