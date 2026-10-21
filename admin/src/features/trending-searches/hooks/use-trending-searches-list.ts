import { useCallback, useMemo } from "react";

import { trendingSearchesService } from "@/features/trending-searches/services/trending-searches.service";
import type { TrendingSearchListParams } from "@/features/trending-searches/types/trending-searches.types";
import {
  CRUD_FILTER_ALL_VALUE,
  type CrudFilterDefinition,
  type CrudSortDefinition,
  mapBooleanFilterValue,
  useServerPaginatedList,
} from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { useTrendingSearchTargetTypeOptions } from "@/shared/hooks/use-options";

const TRENDING_SEARCH_FILTER_IDS = ["publish", "targetType"] as const;

export function useTrendingSearchesList(limit = 10) {
  const t = useTranslation();
  const { options: targetTypeOptions } = useTrendingSearchTargetTypeOptions();

  const filterDefinitions = useMemo<CrudFilterDefinition[]>(
    () => [
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
      {
        id: "targetType",
        label: t.trendingSearchTargetType,
        allLabel: t.filterAll,
        options: targetTypeOptions,
      },
    ],
    [t, targetTypeOptions],
  );

  const sortDefinitions = useMemo<CrudSortDefinition[]>(
    () => [
      {
        id: "sort",
        label: t.sortBy,
        options: [
          { value: "sort_order:asc", label: t.trendingSearchSortOrderAsc },
          { value: "created_at:desc", label: t.sortNewest },
          { value: "created_at:asc", label: t.sortOldest },
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
      publish: mapBooleanFilterValue(values.publish),
      targetType: pick("targetType"),
    } satisfies Pick<TrendingSearchListParams, "publish" | "targetType">;
  }, []);

  const fetchFn = useCallback(
    (
      params: TrendingSearchListParams & { page: number; limit: number },
      signal?: AbortSignal,
    ) => trendingSearchesService.list(params, signal),
    [],
  );

  const list = useServerPaginatedList({
    queryKeyPrefix: "trending-searches",
    exportPath: "/admin/trending-searches/export",
    fetchFn,
    limit,
    filterIds: [...TRENDING_SEARCH_FILTER_IDS],
    mapFiltersToParams,
    defaultSort: "sort_order:asc",
  });

  return {
    ...list,
    filterDefinitions,
    sortDefinitions,
  };
}
