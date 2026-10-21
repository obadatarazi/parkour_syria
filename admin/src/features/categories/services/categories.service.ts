import type { CategoriesService } from "@/features/categories/services/categories.service.types";
import { createApiCategoriesService } from "@/features/categories/services/categories-api.service";

export const categoriesService: CategoriesService = createApiCategoriesService();
