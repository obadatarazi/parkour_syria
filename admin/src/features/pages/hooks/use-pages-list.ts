import { useCallback } from "react";

import { pagesService } from "@/features/pages/services/pages.service";
import type { PageListParams } from "@/features/pages/types/pages.types";
import { useServerPaginatedList } from "@/shared/crud";

export function usePagesList() {
  const fetchFn = useCallback(
    (params: PageListParams & { page: number; limit: number }, signal?: AbortSignal) =>
      pagesService.list(params, signal),
    [],
  );

  return useServerPaginatedList({
    queryKeyPrefix: "pages",
    exportPath: "/admin/pages/export",
    fetchFn,
    limit: 50,
    defaultSort: "id:asc",
  });
}
