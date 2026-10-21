import { useCallback, useMemo } from "react";

import { rolesService } from "@/features/roles/services/roles.service";
import type { RoleListParams } from "@/features/roles/types/roles.types";
import { type CrudSortDefinition, useServerPaginatedList } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

export function useRolesList(limit = 10) {
  const t = useTranslation();

  const sortDefinitions = useMemo<CrudSortDefinition[]>(
    () => [
      {
        id: "sort",
        label: t.sortBy,
        options: [
          { value: "created_at:desc", label: t.sortNewest },
          { value: "created_at:asc", label: t.sortOldest },
          { value: "name:asc", label: t.sortTitleAsc },
          { value: "name:desc", label: t.sortTitleDesc },
          { value: "id:desc", label: t.sortIdDesc },
        ],
      },
    ],
    [t],
  );

  const fetchFn = useCallback(
    (params: RoleListParams & { page: number; limit: number }, signal?: AbortSignal) => rolesService.list(params, signal),
    [],
  );

  const list = useServerPaginatedList({
    queryKeyPrefix: "roles",
    exportPath: "/admin/roles/export",
    fetchFn,
    limit,
    filterIds: [],
    mapFiltersToParams: () => ({}),
    defaultSort: "created_at:desc",
  });

  return {
    ...list,
    sortDefinitions,
  };
}
