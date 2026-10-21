import type { BlogCategoriesService } from "@/features/blog-categories/services/blog-categories.service.types";
import { createApiBlogCategoriesService } from "@/features/blog-categories/services/blog-categories-api.service";

export const blogCategoriesService: BlogCategoriesService = createApiBlogCategoriesService();
