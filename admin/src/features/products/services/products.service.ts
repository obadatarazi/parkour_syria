import type { ProductsService } from "@/features/products/services/products.service.types";
import { createApiProductsService } from "@/features/products/services/products-api.service";

export const productsService: ProductsService = createApiProductsService();
