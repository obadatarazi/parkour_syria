import { useCallback, useMemo } from "react";

import { loyaltyEventsService } from "@/features/loyalty-events/services/loyalty-events.service";
import type { LoyaltyEventListParams } from "@/features/loyalty-events/types/loyalty-events.types";
import {
  type CrudFilterDefinition,
  type CrudSortDefinition,
  mapBooleanFilterValue,
  useServerPaginatedList,
} from "@/shared/crud";
import { CRUD_FILTER_ALL_VALUE } from "@/shared/crud/constants/crud.constants";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { useLoyaltyEventTypeOptions } from "@/shared/hooks/use-options";

const FILTER_IDS = ["type", "isActive"] as const;

export function useLoyaltyEventsList(limit = 10) {
  const t = useTranslation();
  const { options: typeOptions } = useLoyaltyEventTypeOptions();

  const filterDefinitions = useMemo<CrudFilterDefinition[]>(
    () => [
      {
        id: "type",
        label: t.loyaltyEventType,
        allLabel: t.filterAll,
        primary: true,
        options: typeOptions,
      },
      {
        id: "isActive",
        label: t.status,
        allLabel: t.filterAll,
        options: [
          { value: "true", label: t.active },
          { value: "false", label: t.inactive },
        ],
      },
    ],
    [t, typeOptions],
  );

  const sortDefinitions = useMemo<CrudSortDefinition[]>(
    () => [
      {
        id: "sort",
        label: t.sortBy,
        options: [
          { value: "created_at:desc", label: t.sortNewest },
          { value: "created_at:asc", label: t.sortOldest },
          { value: "points:asc", label: t.sortPriorityAsc },
          { value: "points:desc", label: t.sortPriorityDesc },
          { value: "code:asc", label: t.sortCodeAsc },
          { value: "id:desc", label: t.sortIdDesc },
        ],
      },
    ],
    [t],
  );

  const mapFiltersToParams = useCallback((values: Record<string, string>) => {
    const pick = (key: string) =>
      values[key] && values[key] !== CRUD_FILTER_ALL_VALUE ? values[key] : undefined;

    return {
      type: pick("type"),
      isActive: mapBooleanFilterValue(values.isActive),
    } satisfies Pick<LoyaltyEventListParams, "type" | "isActive">;
  }, []);

  const fetchFn = useCallback(
    (params: LoyaltyEventListParams & { page: number; limit: number }, signal?: AbortSignal) =>
      loyaltyEventsService.list(params, signal),
    [],
  );

  const list = useServerPaginatedList({
    queryKeyPrefix: "loyalty-events",
    exportPath: "/admin/loyalty-events/export",
    fetchFn,
    limit,
    filterIds: [...FILTER_IDS],
    mapFiltersToParams,
    defaultSort: "created_at:desc",
  });

  return {
    ...list,
    filterDefinitions,
    sortDefinitions,
  };
}
