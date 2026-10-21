import { useCallback, useMemo } from "react";

import { brandsService } from "@/features/brands/services/brands.service";
import type { BrandListParams } from "@/features/brands/types/brands.types";
import {
  type CrudFilterDefinition,
  type CrudSortDefinition,
  mapBooleanFilterValue,
  useCrudQuery,
  useServerPaginatedList,
} from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { fetchEnumOptions, OPTIONS_ENDPOINTS } from "@/shared/lib/api";

const BRAND_OPTIONS_STALE_TIME_MS = 30 * 60 * 1000;

const BRAND_FILTER_IDS = ["publish"] as const;

export function useBrandsList(limit = 12) {
  const t = useTranslation();

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
    ],
    [t],
  );

  const sortDefinitions = useMemo<CrudSortDefinition[]>(
    () => [
      {
        id: "sort",
        label: t.sortBy,
        options: [
          { value: "created_at:desc", label: t.sortNewest },
          { value: "created_at:asc", label: t.sortOldest },
          { value: "title:asc", label: t.sortTitleAsc },
          { value: "title:desc", label: t.sortTitleDesc },
          { value: "id:desc", label: t.sortIdDesc },
        ],
      },
    ],
    [t],
  );

  const mapFiltersToParams = useCallback(
    (values: Record<string, string>) =>
      ({
        publish: mapBooleanFilterValue(values.publish),
      }) satisfies Pick<BrandListParams, "publish">,
    [],
  );

  const fetchFn = useCallback(
    (params: BrandListParams & { page: number; limit: number }, signal?: AbortSignal) => brandsService.list(params, signal),
    [],
  );

  const list = useServerPaginatedList({
    queryKeyPrefix: "brands",
    exportPath: "/admin/brands/export",
    fetchFn,
    limit,
    filterIds: [...BRAND_FILTER_IDS],
    mapFiltersToParams,
    defaultSort: "created_at:desc",
  });

  return {
    ...list,
    filterDefinitions,
    sortDefinitions,
  };
}

export function useBrandOptions() {
  const query = useCrudQuery({
    queryKey: ["options", "brands"],
    queryFn: (signal) => fetchEnumOptions(OPTIONS_ENDPOINTS.brands, signal),
    staleTime: BRAND_OPTIONS_STALE_TIME_MS,
  });

  return {
    options: query.data ?? [],
    isLoading: query.isLoading,
  };
}
