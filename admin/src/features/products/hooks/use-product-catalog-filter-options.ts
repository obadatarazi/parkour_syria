import { useCrudQuery } from "@/shared/crud";
import { fetchEnumOptions, OPTIONS_ENDPOINTS } from "@/shared/lib/api";

const FILTER_OPTIONS_STALE_TIME_MS = 30 * 60 * 1000;

export function useProductCatalogFilterOptions() {
  const brandsQuery = useCrudQuery({
    queryKey: ["options", "brands", "with-products"],
    queryFn: (signal) =>
      fetchEnumOptions(OPTIONS_ENDPOINTS.brands, signal, { hasProducts: true }),
    staleTime: FILTER_OPTIONS_STALE_TIME_MS,
  });

  const categoriesQuery = useCrudQuery({
    queryKey: ["options", "categories", "with-products"],
    queryFn: (signal) =>
      fetchEnumOptions(OPTIONS_ENDPOINTS.categories, signal, { hasProducts: true }),
    staleTime: FILTER_OPTIONS_STALE_TIME_MS,
  });

  return {
    brandOptions: brandsQuery.data ?? [],
    categoryOptions: categoriesQuery.data ?? [],
    isLoading: brandsQuery.isLoading || categoriesQuery.isLoading,
    isError: brandsQuery.isError || categoriesQuery.isError,
  };
}
