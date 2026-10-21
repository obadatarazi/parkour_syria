import type { CrudEmptyVariant } from "@/shared/crud/types/crud.types";

type ResolveEmptyVariantInput = {
  totalRecords: number;
  filteredCount: number;
  hasSearch: boolean;
  hasActiveFilters: boolean;
  isPermissionDenied?: boolean;
};

export function resolveCrudEmptyVariant({
  totalRecords,
  filteredCount,
  hasSearch,
  hasActiveFilters,
  isPermissionDenied = false,
}: ResolveEmptyVariantInput): CrudEmptyVariant | null {
  if (isPermissionDenied) return "permission-denied";
  if (filteredCount > 0) return null;
  if (totalRecords === 0) return "no-records";
  if (hasSearch) return "no-search-results";
  if (hasActiveFilters) return "no-filter-results";
  return "no-records";
}
