import { useEffect, useMemo } from "react";

import { CRUD_DEFAULT_PAGE_SIZE } from "@/shared/crud/constants/crud.constants";
import { useCrudFilters } from "@/shared/crud/hooks/use-crud-filters";
import { useCrudPagination, useCrudPaginationMeta } from "@/shared/crud/hooks/use-crud-pagination";
import { useCrudSearch } from "@/shared/crud/hooks/use-crud-search";
import { useCrudSelection } from "@/shared/crud/hooks/use-crud-selection";
import type { CrudEmptyVariant, CrudListQueryParams } from "@/shared/crud/types/crud.types";
import { resolveCrudEmptyVariant } from "@/shared/crud/utils/empty-state.utils";
import { applyClientFilters } from "@/shared/crud/utils/filter.utils";
import { paginateList } from "@/shared/crud/utils/pagination.utils";
import { applyClientSearch } from "@/shared/crud/utils/search.utils";

type UseCrudListOptions<T> = {
  items: T[];
  pageSize?: number;
  filterIds?: string[];
  getSearchableValues?: (item: T) => string[];
  getFilterValue?: (item: T, filterId: string) => string;
};

export function useCrudList<T extends { id: string | number }>({
  items,
  pageSize = CRUD_DEFAULT_PAGE_SIZE,
  filterIds = [],
  getSearchableValues,
  getFilterValue,
}: UseCrudListOptions<T>) {
  const search = useCrudSearch();
  const filters = useCrudFilters(filterIds);
  const selection = useCrudSelection();

  const searchedItems = useMemo(() => {
    if (!getSearchableValues) return items;
    return applyClientSearch(items, search.debouncedSearch, getSearchableValues);
  }, [items, search.debouncedSearch, getSearchableValues]);

  const filteredItems = useMemo(() => {
    if (!getFilterValue || filterIds.length === 0) return searchedItems;
    return applyClientFilters(searchedItems, filters.values, getFilterValue);
  }, [searchedItems, filters.values, getFilterValue, filterIds.length]);

  const pagination = useCrudPagination({
    totalItems: filteredItems.length,
    initialPageSize: pageSize,
  });

  const paginationMeta = useCrudPaginationMeta(
    filteredItems.length,
    pagination.page,
    pagination.pageSize,
  );

  const pageItems = useMemo(
    () => paginateList(filteredItems, pagination.page, pagination.pageSize),
    [filteredItems, pagination.page, pagination.pageSize],
  );

  const queryParams: CrudListQueryParams = useMemo(
    () => ({
      page: pagination.page,
      pageSize: pagination.pageSize,
      search: search.debouncedSearch,
      filters: filters.values,
    }),
    [pagination.page, pagination.pageSize, search.debouncedSearch, filters.values],
  );

  const emptyVariant: CrudEmptyVariant | null = useMemo(
    () =>
      resolveCrudEmptyVariant({
        totalRecords: items.length,
        filteredCount: filteredItems.length,
        hasSearch: search.hasSearch,
        hasActiveFilters: filters.hasActiveFilters,
      }),
    [items.length, filteredItems.length, search.hasSearch, filters.hasActiveFilters],
  );

  const { resetPage } = pagination;
  const { clearSelection } = selection;

  useEffect(() => {
    resetPage();
  }, [search.debouncedSearch, filters.hasActiveFilters, resetPage]);

  useEffect(() => {
    clearSelection();
  }, [filteredItems.length, pagination.page, search.debouncedSearch, clearSelection]);

  return {
    search,
    filters,
    pagination,
    paginationMeta,
    selection,
    allItems: items,
    filteredItems,
    pageItems,
    queryParams,
    emptyVariant,
  };
}
