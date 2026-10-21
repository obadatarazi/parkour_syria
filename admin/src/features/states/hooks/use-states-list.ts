import { useCallback, useMemo } from "react";

import { useCountryOptions } from "@/features/countries/hooks/use-countries-list";
import { statesService } from "@/features/states/services/states.service";
import type { StateListParams } from "@/features/states/types/states.types";
import {
  type CrudFilterDefinition,
  type CrudSortDefinition,
  mapBooleanFilterValue,
  useServerPaginatedList,
} from "@/shared/crud";
import { CRUD_FILTER_ALL_VALUE } from "@/shared/crud/constants/crud.constants";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

const STATE_FILTER_IDS = ["publish", "countryId"] as const;

export function useStatesList(limit = 10) {
  const t = useTranslation();
  const { options: countryOptions } = useCountryOptions();

  const filterDefinitions = useMemo<CrudFilterDefinition[]>(
    () => [
      {
        id: "countryId",
        label: t.country,
        allLabel: t.filterAll,
        options: countryOptions,
      },
      {
        id: "publish",
        label: t.status,
        allLabel: t.filterAll,
        primary: true,
        options: [
          { value: "true", label: t.active },
          { value: "false", label: t.inactive },
        ],
      },
    ],
    [countryOptions, t],
  );

  const sortDefinitions = useMemo<CrudSortDefinition[]>(
    () => [
      {
        id: "sort",
        label: t.sortBy,
        options: [
          { value: "created_at:desc", label: t.sortNewest },
          { value: "created_at:asc", label: t.sortOldest },
          { value: "id:desc", label: t.sortIdDesc },
        ],
      },
    ],
    [t],
  );

  const mapFiltersToParams = useCallback((values: Record<string, string>) => {
    const countryId = values.countryId;
    return {
      publish: mapBooleanFilterValue(values.publish),
      countryId:
        countryId && countryId !== CRUD_FILTER_ALL_VALUE ? Number(countryId) : undefined,
    } satisfies Pick<StateListParams, "publish" | "countryId">;
  }, []);

  const fetchFn = useCallback(
    (params: StateListParams & { page: number; limit: number }, signal?: AbortSignal) => statesService.list(params, signal),
    [],
  );

  const list = useServerPaginatedList({
    queryKeyPrefix: "states",
    exportPath: "/admin/states/export",
    fetchFn,
    limit,
    filterIds: [...STATE_FILTER_IDS],
    mapFiltersToParams,
    defaultSort: "created_at:desc",
  });

  return {
    ...list,
    filterDefinitions,
    sortDefinitions,
  };
}
