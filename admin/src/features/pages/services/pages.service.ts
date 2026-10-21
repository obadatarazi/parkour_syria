import type { PagesService } from "@/features/pages/services/pages.service.types";
import { createApiPagesService } from "@/features/pages/services/pages-api.service";

export const pagesService: PagesService = createApiPagesService();
