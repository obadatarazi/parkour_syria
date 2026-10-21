import { useCallback, useMemo } from "react";

import { useAreaOptions } from "@/features/areas/hooks/use-areas-list";
import { eventsService } from "@/features/events/services/events.service";
import type { EventListParams } from "@/features/events/types/events.types";
import { eventTypeOptions } from "@/features/events/utils/event-labels";
import {
  type CrudFilterDefinition,
  type CrudSortDefinition,
  mapBooleanFilterValue,
  mapStringFilterValue,
  useServerPaginatedList,
} from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

const EVENT_FILTER_IDS = ["upcoming", "type", "areaId", "publish"] as const;

export function useEventsList(limit = 20) {
  const t = useTranslation();
  const { options: areaOptions } = useAreaOptions();

  const filterDefinitions = useMemo<CrudFilterDefinition[]>(
    () => [
      {
        id: "upcoming",
        label: t.eventTiming,
        allLabel: t.filterAll,
        primary: true,
        // The API can narrow to upcoming events only, past ones are told apart by their badge.
        options: [{ value: "true", label: t.eventUpcoming }],
      },
      {
        id: "type",
        label: t.eventType,
        allLabel: t.filterAll,
        primary: true,
        options: eventTypeOptions(t),
      },
      {
        id: "areaId",
        label: t.fieldArea,
        allLabel: t.allAreas,
        options: areaOptions,
      },
      {
        id: "publish",
        label: t.status,
        allLabel: t.filterAll,
        options: [
          { value: "true", label: t.publishedLabel },
          { value: "false", label: t.draftLabel },
        ],
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
          { value: "starts_at:desc", label: `${t.fieldStartsAt} ↓` },
          { value: "starts_at:asc", label: `${t.fieldStartsAt} ↑` },
          { value: "created_at:desc", label: t.sortNewest },
        ],
      },
    ],
    [t],
  );

  const mapFiltersToParams = useCallback(
    (values: Record<string, string>) =>
      ({
        upcoming: mapBooleanFilterValue(values.upcoming),
        type: mapStringFilterValue(values.type),
        areaId: mapStringFilterValue(values.areaId),
        publish: mapBooleanFilterValue(values.publish),
      }) satisfies Pick<EventListParams, "upcoming" | "type" | "areaId" | "publish">,
    [],
  );

  const fetchFn = useCallback(
    (params: EventListParams & { page: number; limit: number }, signal?: AbortSignal) =>
      eventsService.list(params, signal),
    [],
  );

  const list = useServerPaginatedList({
    queryKeyPrefix: "events",
    exportPath: "/admin/events/export",
    fetchFn,
    limit,
    filterIds: [...EVENT_FILTER_IDS],
    mapFiltersToParams,
    defaultSort: "starts_at:desc",
  });

  return { ...list, filterDefinitions, sortDefinitions };
}
