import type { CountriesService } from "@/features/countries/services/countries.service.types";
import { createApiCountriesService } from "@/features/countries/services/countries-api.service";

export const countriesService: CountriesService = createApiCountriesService();
