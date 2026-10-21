import type { ProductVariantsService } from "@/features/products/services/product-variants.service.types";
import { createApiProductVariantsService } from "@/features/products/services/product-variants-api.service";

export const productVariantsService: ProductVariantsService = createApiProductVariantsService();
