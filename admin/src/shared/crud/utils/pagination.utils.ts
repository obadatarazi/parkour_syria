export const LIST_PAGE_QUERY_KEY = "page";
export const LIST_LIMIT_QUERY_KEY = "limit";

export function paginateList<T>(items: T[], page: number, pageSize: number): T[] {
  const safePage = Math.max(page, 1);
  const start = (safePage - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function parsePositiveIntParam(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return parsed;
}

/** Writes `page` / `limit` onto the current search params. Returns true when anything changed. */
export function applyListPaginationSearchParams(
  params: URLSearchParams,
  page: number,
  limit: number,
  defaultLimit: number,
): boolean {
  let changed = false;

  const desiredPage = page <= 1 ? null : String(page);
  const currentPage = params.get(LIST_PAGE_QUERY_KEY);
  if (desiredPage === null) {
    if (params.has(LIST_PAGE_QUERY_KEY)) {
      params.delete(LIST_PAGE_QUERY_KEY);
      changed = true;
    }
  } else if (currentPage !== desiredPage) {
    params.set(LIST_PAGE_QUERY_KEY, desiredPage);
    changed = true;
  }

  const desiredLimit = limit === defaultLimit ? null : String(limit);
  const currentLimit = params.get(LIST_LIMIT_QUERY_KEY);
  if (desiredLimit === null) {
    if (params.has(LIST_LIMIT_QUERY_KEY)) {
      params.delete(LIST_LIMIT_QUERY_KEY);
      changed = true;
    }
  } else if (currentLimit !== desiredLimit) {
    params.set(LIST_LIMIT_QUERY_KEY, desiredLimit);
    changed = true;
  }

  return changed;
}

export function getTotalPages(totalItems: number, pageSize: number): number {
  return Math.max(1, Math.ceil(totalItems / pageSize));
}

export function createPaginationMeta(totalItems: number, page: number, pageSize: number) {
  const totalPages = getTotalPages(totalItems, pageSize);
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, totalItems);

  return {
    page: safePage,
    pageSize,
    totalItems,
    totalPages,
    start,
    end,
  };
}
