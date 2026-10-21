import { useCallback, useMemo } from "react";

import { attributesService } from "@/features/attributes/services/attributes.service";
import type { AttributeListParams } from "@/features/attributes/types/attributes.types";
import {
  type CrudFilterDefinition,
  type CrudSortDefinition,
  mapBooleanFilterValue,
  useServerPaginatedList,
} from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

const ATTRIBUTE_FILTER_IDS = ["publish"] as const;

export function useAttributesList(limit = 10) {
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
      }) satisfies Pick<AttributeListParams, "publish">,
    [],
  );

  const fetchFn = useCallback(
    (params: AttributeListParams & { page: number; limit: number }, signal?: AbortSignal) => attributesService.list(params, signal),
    [],
  );

  const list = useServerPaginatedList({
    queryKeyPrefix: "attributes",
    exportPath: "/admin/attributes/export",
    fetchFn,
    limit,
    filterIds: [...ATTRIBUTE_FILTER_IDS],
    mapFiltersToParams,
    defaultSort: "created_at:desc",
  });

  return {
    ...list,
    filterDefinitions,
    sortDefinitions,
  };
}
