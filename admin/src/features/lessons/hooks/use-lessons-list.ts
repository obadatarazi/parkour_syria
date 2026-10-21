import { useCallback, useMemo } from "react";

import { lessonsService } from "@/features/lessons/services/lessons.service";
import type { LessonListParams } from "@/features/lessons/types/lessons.types";
import {
  type CrudFilterDefinition,
  type CrudSortDefinition,
  mapBooleanFilterValue,
  useServerPaginatedList,
} from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

const LESSON_FILTER_IDS = ["publish"] as const;

export function useLessonsList(limit = 20) {
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
      ({ publish: mapBooleanFilterValue(values.publish) }) satisfies Pick<LessonListParams, "publish">,
    [],
  );

  const fetchFn = useCallback(
    (params: LessonListParams & { page: number; limit: number }, signal?: AbortSignal) =>
      lessonsService.list(params, signal),
    [],
  );

  const list = useServerPaginatedList({
    queryKeyPrefix: "lessons",
    exportPath: "/admin/lessons/export",
    fetchFn,
    limit,
    filterIds: [...LESSON_FILTER_IDS],
    mapFiltersToParams,
    defaultSort: "sort_order:asc",
  });

  return { ...list, filterDefinitions, sortDefinitions };
}
