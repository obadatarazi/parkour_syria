import { useCallback, useMemo } from "react";

import { useAreaOptions } from "@/features/areas/hooks/use-areas-list";
import { suggestionsService } from "@/features/suggestions/services/suggestions.service";
import {
  SUGGESTION_STATUSES,
  SUGGESTION_TYPES,
  type SuggestionListParams,
  suggestionStatusLabel,
  suggestionTypeLabel,
} from "@/features/suggestions/types/suggestions.types";
import {
  type CrudFilterDefinition,
  type CrudSortDefinition,
  mapStringFilterValue,
  useServerPaginatedList,
} from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

const SUGGESTION_FILTER_IDS = ["status", "type", "areaId"] as const;

export function useSuggestionsList(limit = 20) {
  const t = useTranslation();
  const { options: areaOptions } = useAreaOptions();

  const filterDefinitions = useMemo<CrudFilterDefinition[]>(
    () => [
      {
        id: "status",
        label: t.suggestionStatus,
        allLabel: t.filterAll,
        primary: true,
        options: SUGGESTION_STATUSES.map((value) => ({
          value,
          label: suggestionStatusLabel(t, value),
        })),
      },
      {
        id: "type",
        label: t.suggestionType,
        allLabel: t.filterAll,
        primary: true,
        options: SUGGESTION_TYPES.map((value) => ({ value, label: suggestionTypeLabel(t, value) })),
      },
      {
        id: "areaId",
        label: t.fieldArea,
        allLabel: t.allAreas,
        options: areaOptions,
      },
    ],
    [areaOptions, t],
  );

  const sortDefinitions = useMemo<CrudSortDefinition[]>(
    () => [
      {
        id: "sort",
        label: t.sortBy,
        options: [
          { value: "created_at:desc", label: t.sortNewest },
          { value: "created_at:asc", label: t.sortOldest },
        ],
      },
    ],
    [t],
  );

  const mapFiltersToParams = useCallback(
    (values: Record<string, string>) =>
      ({
        status: mapStringFilterValue(values.status),
        type: mapStringFilterValue(values.type),
        areaId: mapStringFilterValue(values.areaId),
      }) satisfies Pick<SuggestionListParams, "status" | "type" | "areaId">,
    [],
  );

  const fetchFn = useCallback(
    (params: SuggestionListParams & { page: number; limit: number }, signal?: AbortSignal) =>
      suggestionsService.list(params, signal),
    [],
  );

  const list = useServerPaginatedList({
    queryKeyPrefix: "suggestions",
    exportPath: "/admin/suggestions/export",
    fetchFn,
    limit,
    filterIds: [...SUGGESTION_FILTER_IDS],
    // The moderation queue: what still needs a decision comes up first.
    defaultFilterValues: { status: "pending" },
    mapFiltersToParams,
    defaultSort: "created_at:desc",
  });

  return { ...list, filterDefinitions, sortDefinitions };
}
