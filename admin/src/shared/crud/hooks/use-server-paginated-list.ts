import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";

import { useCrudCsvExport } from "@/shared/crud/hooks/use-crud-csv-export";
import { useCrudFilters } from "@/shared/crud/hooks/use-crud-filters";
import { useCrudQuery } from "@/shared/crud/hooks/use-crud-query";
import { useCrudSearch } from "@/shared/crud/hooks/use-crud-search";
import { useCrudSelection } from "@/shared/crud/hooks/use-crud-selection";
import type { CrudFilterValues } from "@/shared/crud/types/crud.types";
import { parseSortParam, sanitizeFilterParams } from "@/shared/crud/utils/filter.utils";
import {
  applyListPaginationSearchParams,
  LIST_LIMIT_QUERY_KEY,
  LIST_PAGE_QUERY_KEY,
  parsePositiveIntParam,
} from "@/shared/crud/utils/pagination.utils";
import type { CsvExportParams } from "@/shared/lib/api/csv-export";
import type { PaginatedResult } from "@/shared/types";

type ServerListParams = {
  page: number;
  limit: number;
  search?: string;
  sort?: string;
  direction?: "asc" | "desc";
  [key: string]: string | number | boolean | undefined;
};

type UseServerPaginatedListOptions<T> = {
  queryKeyPrefix: string;
  fetchFn: (params: ServerListParams, signal?: AbortSignal) => Promise<PaginatedResult<T>>;
  limit?: number;
  filterIds?: string[];
  defaultFilterValues?: Partial<CrudFilterValues>;
  /** Applied on first paint only (e.g. `?segment=` deep links). Reset still uses defaults. */
  initialFilterValues?: Partial<CrudFilterValues>;
  mapFiltersToParams?: (
    values: CrudFilterValues,
  ) => Record<string, string | number | boolean | undefined>;
  defaultSort?: string;
  /** Seeds the search field (e.g. from `?search=` deep links). */
  initialSearch?: string;
  /** `GET {exportPath}` CSV from the backend, using the current list filters. */
  exportPath?: string;
  /** Extra or rewritten query keys for the export (e.g. orders `userId`). */
  prepareExportParams?: (params: CsvExportParams) => CsvExportParams;
  /**
   * Keep page/limit in the URL so a browser refresh stays on the same page.
   * Disable for nested lists (drawers) that should not own the route query string.
   */
  persistPageInUrl?: boolean;
  /** Forwarded to useCrudQuery — rare-change lists (settings) can stay warm longer. */
  staleTime?: number;
};

export function useServerPaginatedList<T>({
  queryKeyPrefix,
  fetchFn,
  limit: initialLimit = 10,
  filterIds = [],
  defaultFilterValues,
  initialFilterValues,
  mapFiltersToParams,
  defaultSort = "created_at:desc",
  initialSearch = "",
  exportPath,
  prepareExportParams,
  persistPageInUrl = true,
  staleTime,
}: UseServerPaginatedListOptions<T>) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { search, debouncedSearch, setSearch, resetSearch } = useCrudSearch(initialSearch);
  const filters = useCrudFilters(filterIds, defaultFilterValues, initialFilterValues);
  const selection = useCrudSelection();
  const [sort, setSort] = useState(defaultSort);
  const [limit, setLimit] = useState(() =>
    persistPageInUrl
      ? parsePositiveIntParam(searchParams.get(LIST_LIMIT_QUERY_KEY), initialLimit)
      : initialLimit,
  );

  const filterParams = useMemo(
    () => sanitizeFilterParams(mapFiltersToParams?.(filters.values) ?? {}),
    [filters.values, mapFiltersToParams],
  );

  const apiParamsSignature = useMemo(() => JSON.stringify(filterParams), [filterParams]);

  // Always send sort/direction — including the default — so Laravel does not fall
  // back to unsorted (typically id asc / oldest first) when the UI expects newest first.
  const sortParams = useMemo(() => {
    if (!sort) return {};
    return parseSortParam(sort);
  }, [sort]);

  const filterSignature = useMemo(
    () => filterIds.map((id) => `${id}:${filters.values[id] ?? ""}`).join("|"),
    [filterIds, filters.values],
  );

  /**
   * Search/filter/sort/page-size identity. When this changes, page must be 1 on the same
   * render that builds the query — not in a later effect (which caused page=N
   * fetches with the new criteria).
   */
  const listCriteriaKey = useMemo(
    () => `${debouncedSearch}\0${filterSignature}\0${sort}\0${limit}`,
    [debouncedSearch, filterSignature, sort, limit],
  );

  const [pagination, setPagination] = useState({
    page: persistPageInUrl
      ? parsePositiveIntParam(searchParams.get(LIST_PAGE_QUERY_KEY), 1)
      : 1,
    criteriaKey: listCriteriaKey,
  });

  // Derive page synchronously so params/queryKey never use a stale page with new criteria.
  const page = pagination.criteriaKey === listCriteriaKey ? pagination.page : 1;

  const setPage = useCallback(
    (nextPage: number) => {
      setPagination({ page: nextPage, criteriaKey: listCriteriaKey });
    },
    [listCriteriaKey],
  );

  const setPageSize = useCallback((nextPageSize: number) => {
    setLimit(Math.max(1, nextPageSize));
  }, []);

  const params = useMemo(
    () => ({
      page,
      limit,
      search: debouncedSearch.trim() || undefined,
      ...sortParams,
      ...filterParams,
    }),
    [page, limit, debouncedSearch, sortParams, filterParams],
  );

  const queryFn = useCallback(
    (signal?: AbortSignal) => fetchFn(params, signal),
    [fetchFn, params],
  );

  const query = useCrudQuery({
    queryKey: [
      queryKeyPrefix,
      String(page),
      debouncedSearch,
      String(limit),
      filterSignature,
      apiParamsSignature,
      sort,
    ],
    queryFn,
    staleTime,
  });

  const total = query.data?.total ?? 0;
  const pageSize = limit;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const items = query.data?.data ?? [];

  const patchItems = useCallback(
    (updater: (items: T[]) => T[]) => {
      query.patchData((previous) => ({
        ...previous,
        data: updater(previous.data),
      }));
    },
    [query.patchData],
  );

  useEffect(() => {
    selection.clearSelection();
  }, [page, limit, debouncedSearch, filterSignature, sort, selection.clearSelection]);

  useEffect(() => {
    if (!query.data) return;
    const maxPage = Math.max(1, Math.ceil(query.data.total / pageSize));
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [page, pageSize, query.data, setPage]);

  useEffect(() => {
    if (!persistPageInUrl) return;

    const urlPage = parsePositiveIntParam(searchParams.get(LIST_PAGE_QUERY_KEY), 1);
    const urlLimit = searchParams.has(LIST_LIMIT_QUERY_KEY)
      ? parsePositiveIntParam(searchParams.get(LIST_LIMIT_QUERY_KEY), initialLimit)
      : initialLimit;
    if (urlPage === page && urlLimit === limit) return;

    const next = new URLSearchParams(searchParams);
    if (!applyListPaginationSearchParams(next, page, limit, initialLimit)) return;
    setSearchParams(next, { replace: true });
  }, [initialLimit, limit, page, persistPageInUrl, searchParams, setSearchParams]);

  const exportParams = useMemo(() => {
    const next: CsvExportParams = {
      search: debouncedSearch.trim() || undefined,
      ...sortParams,
      ...filterParams,
    };
    return prepareExportParams ? prepareExportParams(next) : next;
  }, [debouncedSearch, filterParams, prepareExportParams, sortParams]);

  const { exportCsv, isExportingCsv } = useCrudCsvExport({
    path: exportPath,
    params: exportParams,
  });

  return {
    ...query,
    search,
    debouncedSearch,
    setSearch,
    resetSearch,
    page,
    setPage,
    setPageSize,
    total,
    totalPages,
    pageSize,
    items,
    patchItems,
    filters,
    sort,
    setSort,
    selection,
    exportCsv,
    isExportingCsv,
    filterParams,
    sortParams,
  };
}
