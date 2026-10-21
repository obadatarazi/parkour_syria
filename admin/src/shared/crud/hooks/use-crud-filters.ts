import { useCallback, useMemo, useState } from "react";

import { CRUD_FILTER_ALL_VALUE } from "@/shared/crud/constants/crud.constants";
import type { CrudFiltersState, CrudFilterValues } from "@/shared/crud/types/crud.types";
import { createDefaultFilterValues, isActiveFilterValue } from "@/shared/crud/utils/filter.utils";

export function useCrudFilters(
  filterIds: string[],
  defaultValues?: Partial<CrudFilterValues>,
  initialValues?: Partial<CrudFilterValues>,
): CrudFiltersState {
  const [values, setValues] = useState<CrudFilterValues>(() => ({
    ...createDefaultFilterValues(filterIds),
    ...(defaultValues as CrudFilterValues | undefined),
    ...(initialValues as CrudFilterValues | undefined),
  }));

  const setFilter = useCallback((filterId: string, value: string) => {
    setValues((current) => ({ ...current, [filterId]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setValues({
      ...createDefaultFilterValues(filterIds),
      ...(defaultValues as CrudFilterValues | undefined),
    });
  }, [filterIds, defaultValues]);

  const activeFilterCount = useMemo(() => {
    return Object.entries(values).filter(([id, value]) => {
      if (!isActiveFilterValue(value)) return false;
      if (defaultValues?.[id] === value) return false;
      return true;
    }).length;
  }, [values, defaultValues]);

  return useMemo(
    () => ({
      values,
      setFilter,
      resetFilters,
      hasActiveFilters: activeFilterCount > 0,
      activeFilterCount,
    }),
    [values, setFilter, resetFilters, activeFilterCount],
  );
}

export function getFilterAllValue() {
  return CRUD_FILTER_ALL_VALUE;
}
