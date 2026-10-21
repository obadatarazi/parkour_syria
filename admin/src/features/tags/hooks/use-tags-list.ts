import { useCallback, useMemo } from "react";

import { tagsService } from "@/features/tags/services/tags.service";
import type { TagListParams } from "@/features/tags/types/tags.types";
import {
  type CrudFilterDefinition,
  type CrudSortDefinition,
  mapBooleanFilterValue,
  useServerPaginatedList,
} from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

const TAG_FILTER_IDS = ["publish"] as const;

export function useTagsList(limit = 10) {
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
      }) satisfies Pick<TagListParams, "publish">,
    [],
  );

  const fetchFn = useCallback(
    (params: TagListParams & { page: number; limit: number }, signal?: AbortSignal) => tagsService.list(params, signal),
    [],
  );

  const list = useServerPaginatedList({
    queryKeyPrefix: "tags",
    exportPath: "/admin/tags/export",
    fetchFn,
    limit,
    filterIds: [...TAG_FILTER_IDS],
    mapFiltersToParams,
    defaultSort: "created_at:desc",
  });

  return {
    ...list,
    filterDefinitions,
    sortDefinitions,
  };
}
