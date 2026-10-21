import { useMemo, useState } from "react";

export function usePaged<T extends Record<string, unknown>>(
  data: T[],
  perPage = 8,
) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () =>
      data.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(search.toLowerCase()),
        ),
      ),
    [data, search],
  );

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, pages);
  const slice = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  return {
    search,
    setSearch,
    page: safePage,
    setPage,
    pages,
    slice,
    total: data.length,
    filteredLen: filtered.length,
  };
}
