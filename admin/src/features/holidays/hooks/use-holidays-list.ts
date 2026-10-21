import { useCallback, useMemo } from "react";

import { holidaysService } from "@/features/holidays/services/holidays.service";
import type { HolidayListParams } from "@/features/holidays/types/holidays.types";
import {
  type CrudFilterDefinition,
  type CrudSortDefinition,
  mapBooleanFilterValue,
  useServerPaginatedList,
} from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

const HOLIDAY_FILTER_IDS = ["isActive"] as const;

export function useHolidaysList(limit = 10) {
  const t = useTranslation();

  const filterDefinitions = useMemo<CrudFilterDefinition[]>(
    () => [
      {
        id: "isActive",
        label: t.status,
        allLabel: t.filterAll,
        primary: true,
        options: [
          { value: "true", label: t.active },
          { value: "false", label: t.inactive },
        ],
      },
    ],
    [t],
  );

  const sortDefinitions = useMemo<CrudSortDefinition[]>(
    () => [
      {
        id: "sort",
        label: t.sortBy,
        options: [
          { value: "date:desc", label: t.sortNewest },
          { value: "date:asc", label: t.sortOldest },
          { value: "created_at:desc", label: t.sortNewest },
          { value: "created_at:asc", label: t.sortOldest },
          { value: "id:desc", label: t.sortIdDesc },
        ],
      },
    ],
    [t],
  );

  const mapFiltersToParams = useCallback((values: Record<string, string>) => {
    return {
      isActive: mapBooleanFilterValue(values.isActive),
    } satisfies Pick<HolidayListParams, "isActive">;
  }, []);

  const fetchFn = useCallback(
    (params: HolidayListParams & { page: number; limit: number }, signal?: AbortSignal) =>
      holidaysService.list(params, signal),
    [],
  );

  const list = useServerPaginatedList({
    queryKeyPrefix: "holidays",
    exportPath: "/admin/holidays/export",
    fetchFn,
    limit,
    filterIds: [...HOLIDAY_FILTER_IDS],
    mapFiltersToParams,
    defaultSort: "date:desc",
  });

  return {
    ...list,
    filterDefinitions,
    sortDefinitions,
  };
}
