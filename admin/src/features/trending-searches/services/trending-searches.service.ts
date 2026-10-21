import type { TrendingSearchesService } from "@/features/trending-searches/services/trending-searches.service.types";
import { createApiTrendingSearchesService } from "@/features/trending-searches/services/trending-searches-api.service";

export const trendingSearchesService: TrendingSearchesService = createApiTrendingSearchesService();
