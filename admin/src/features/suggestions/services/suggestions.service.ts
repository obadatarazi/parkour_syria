import type { SuggestionsService } from "@/features/suggestions/services/suggestions.service.types";
import { createApiSuggestionsService } from "@/features/suggestions/services/suggestions-api.service";

export const suggestionsService: SuggestionsService = createApiSuggestionsService();
