import { useCallback, useMemo, useState } from "react";

import { CRUD_DEFAULT_PAGE_SIZE } from "@/shared/crud/constants/crud.constants";
import type { CrudPaginationState } from "@/shared/crud/types/crud.types";
import { createPaginationMeta, getTotalPages } from "@/shared/crud/utils/pagination.utils";

type UseCrudPaginationOptions = {
  totalItems: number;
  initialPage?: number;
  initialPageSize?: number;
};

export function useCrudPagination({
  totalItems,
  initialPage = 1,
  initialPageSize = CRUD_DEFAULT_PAGE_SIZE,
}: UseCrudPaginationOptions): CrudPaginationState {
  const [page, setPageState] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const totalPages = useMemo(() => getTotalPages(totalItems, pageSize), [totalItems, pageSize]);

  const setPage = useCallback(
    (nextPage: number) => {
      setPageState(Math.min(Math.max(nextPage, 1), getTotalPages(totalItems, pageSize)));
    },
    [totalItems, pageSize],
  );

  const setPageSize = useCallback((nextPageSize: number) => {
    setPageSizeState(nextPageSize);
    setPageState(1);
  }, []);

  const resetPage = useCallback(() => {
    setPageState(1);
  }, []);

  return {
    page: Math.min(page, totalPages),
    pageSize,
    totalItems,
    totalPages,
    setPage,
    setPageSize,
    resetPage,
  };
}

export function useCrudPaginationMeta(totalItems: number, page: number, pageSize: number) {
  return useMemo(
    () => createPaginationMeta(totalItems, page, pageSize),
    [totalItems, page, pageSize],
  );
}
