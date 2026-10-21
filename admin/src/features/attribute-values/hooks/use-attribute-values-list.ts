import { useCallback, useMemo } from "react";

import { attributeValuesService } from "@/features/attribute-values/services/attribute-values.service";
import type { AttributeValueListParams } from "@/features/attribute-values/types/attribute-values.types";
import { attributesService } from "@/features/attributes/services/attributes.service";
import {
  type CrudFilterDefinition,
  type CrudSortDefinition,
  mapBooleanFilterValue,
  useCrudQuery,
  useServerPaginatedList,
} from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

const ATTRIBUTE_VALUE_FILTER_IDS = ["publish", "attributeId"] as const;

export function useAttributeValuesList(limit = 10) {
  const t = useTranslation();

  const attributesQuery = useCrudQuery({
    queryKey: ["attributes", "filter-options"],
    queryFn: (signal) => attributesService.list({ limit: 100, publish: true }, signal),
    staleTime: 30 * 60 * 1000,
  });

  const attributeFilterOptions = useMemo(
    () =>
      (attributesQuery.data?.data ?? []).map((attribute) => ({
        value: String(attribute.id),
        label: attribute.title,
      })),
    [attributesQuery.data],
  );

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
        id: "attributeId",
        label: t.attribute,
        allLabel: t.filterAll,
        options: attributeFilterOptions,
      },
    ],
    [attributeFilterOptions, t],
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
        attributeId: values.attributeId ? Number(values.attributeId) : undefined,
      }) satisfies Pick<AttributeValueListParams, "publish" | "attributeId">,
    [],
  );

  const fetchFn = useCallback(
    (params: AttributeValueListParams & { page: number; limit: number }, signal?: AbortSignal) =>
      attributeValuesService.list(params, signal),
    [],
  );

  const list = useServerPaginatedList({
    queryKeyPrefix: "attribute-values",
    exportPath: "/admin/attribute-values/export",
    fetchFn,
    limit,
    filterIds: [...ATTRIBUTE_VALUE_FILTER_IDS],
    mapFiltersToParams,
    defaultSort: "created_at:desc",
  });

  return {
    ...list,
    filterDefinitions,
    sortDefinitions,
  };
}
