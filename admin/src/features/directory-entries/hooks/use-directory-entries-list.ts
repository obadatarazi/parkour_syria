import { useCallback, useMemo } from "react";

import { useAreaOptions } from "@/features/areas/hooks/use-areas-list";
import { directoryEntriesService } from "@/features/directory-entries/services/directory-entries.service";
import type { DirectoryEntryListParams } from "@/features/directory-entries/types/directory-entries.types";
import { directoryEntryTypeOptions } from "@/features/directory-entries/utils/directory-entry-labels";
import {
  type CrudFilterDefinition,
  type CrudSortDefinition,
  mapBooleanFilterValue,
  mapStringFilterValue,
  useServerPaginatedList,
} from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

const DIRECTORY_ENTRY_FILTER_IDS = ["type", "areaId", "verified", "publish"] as const;

export function useDirectoryEntriesList(limit = 20) {
  const t = useTranslation();
  const { options: areaOptions } = useAreaOptions();

  const filterDefinitions = useMemo<CrudFilterDefinition[]>(
    () => [
      {
        id: "type",
        label: t.directoryType,
        allLabel: t.filterAll,
        primary: true,
        options: directoryEntryTypeOptions(t),
      },
      {
        id: "areaId",
        label: t.fieldArea,
        allLabel: t.allAreas,
        primary: true,
        options: areaOptions,
      },
      {
        id: "verified",
        label: t.fieldVerified,
        allLabel: t.filterAll,
        options: [
          { value: "true", label: t.verifiedYes },
          { value: "false", label: t.verifiedNo },
        ],
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
      ({
        type: mapStringFilterValue(values.type),
        areaId: mapStringFilterValue(values.areaId),
        verified: mapBooleanFilterValue(values.verified),
        publish: mapBooleanFilterValue(values.publish),
      }) satisfies Pick<DirectoryEntryListParams, "type" | "areaId" | "verified" | "publish">,
    [],
  );

  const fetchFn = useCallback(
    (params: DirectoryEntryListParams & { page: number; limit: number }, signal?: AbortSignal) =>
      directoryEntriesService.list(params, signal),
    [],
  );

  const list = useServerPaginatedList({
    queryKeyPrefix: "directory-entries",
    exportPath: "/admin/directory-entries/export",
    fetchFn,
    limit,
    filterIds: [...DIRECTORY_ENTRY_FILTER_IDS],
    mapFiltersToParams,
    defaultSort: "sort_order:asc",
  });

  return { ...list, filterDefinitions, sortDefinitions };
}
