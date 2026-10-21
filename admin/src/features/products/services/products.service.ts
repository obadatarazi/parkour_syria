import { createApiProductsService } from "@/features/products/services/products-api.service";
import type { ProductsService } from "@/features/products/services/products.service.types";

export const productsService: ProductsService = createApiProductsService();
