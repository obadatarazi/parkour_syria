import { useCallback, useMemo } from "react";

import { areasService } from "@/features/areas/services/areas.service";
import type { Area, AreaListParams } from "@/features/areas/types/areas.types";
import {
  type CrudFilterDefinition,
  type CrudSortDefinition,
  mapBooleanFilterValue,
  useCrudQuery,
  useServerPaginatedList,
} from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { pickLocaleText } from "@/shared/lib/api/locale-fields.utils";

const AREA_FILTER_IDS = ["publish"] as const;

export function useAreasList(limit = 20) {
  const t = useTranslation();

  const filterDefinitions = useMemo<CrudFilterDefinition[]>(
    () => [
      {
        id: "publish",
        label: t.status,
        allLabel: t.filterAll,
        primary: true,
        options: [
          { value: "true", label: t.publishedLabel },
          { value: "false", label: t.draftLabel },
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
          { value: "sort_order:asc", label: t.sortOrder },
          { value: "created_at:desc", label: t.sortNewest },
          { value: "created_at:asc", label: t.sortOldest },
        ],
      },
    ],
    [t],
  );

  const mapFiltersToParams = useCallback(
    (values: Record<string, string>) =>
      ({ publish: mapBooleanFilterValue(values.publish) }) satisfies Pick<AreaListParams, "publish">,
    [],
  );

  const fetchFn = useCallback(
    (params: AreaListParams & { page: number; limit: number }, signal?: AbortSignal) =>
      areasService.list(params, signal),
    [],
  );

  const list = useServerPaginatedList({
    queryKeyPrefix: "areas",
    exportPath: "/admin/areas/export",
    fetchFn,
    limit,
    filterIds: [...AREA_FILTER_IDS],
    mapFiltersToParams,
    defaultSort: "sort_order:asc",
  });

  return { ...list, filterDefinitions, sortDefinitions };
}

/** Area picker options for the directory, events and suggestions forms and filters. */
export function useAreaOptions() {
  const queryFn = useCallback(
    (signal?: AbortSignal) => areasService.list({ limit: 200, sort: "sort_order", direction: "asc" }, signal),
    [],
  );

  const query = useCrudQuery({
    queryKey: ["areas", "options"],
    queryFn,
    staleTime: 10 * 60 * 1000,
  });

  const options = useMemo(
    () =>
      (query.data?.data ?? []).map((area: Area) => ({
        value: String(area.id),
        label: pickLocaleText(area.translations, "name", area.name),
      })),
    [query.data?.data],
  );

  return { options, isLoading: query.isLoading };
}
