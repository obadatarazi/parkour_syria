import type { CurrenciesService } from "@/features/currencies/services/currencies.service.types";
import { createApiCurrenciesService } from "@/features/currencies/services/currencies-api.service";

export const currenciesService: CurrenciesService = createApiCurrenciesService();
