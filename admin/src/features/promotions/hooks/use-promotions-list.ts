import { useCallback, useMemo } from "react";

import { promotionsService } from "@/features/promotions/services/promotions.service";
import type { PromotionListParams } from "@/features/promotions/types/promotions.types";
import {
  type CrudFilterDefinition,
  type CrudSortDefinition,
  mapBooleanFilterValue,
  useServerPaginatedList,
} from "@/shared/crud";
import { CRUD_FILTER_ALL_VALUE } from "@/shared/crud/constants/crud.constants";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { usePromotionTypeOptions } from "@/shared/hooks/use-options";

const FILTER_IDS = ["type", "isActive", "isRequireLogin", "isRunning"] as const;

export function usePromotionsList(limit = 10) {
  const t = useTranslation();
  const { options: typeOptions } = usePromotionTypeOptions();

  const filterDefinitions = useMemo<CrudFilterDefinition[]>(
    () => [
      {
        id: "isActive",
        label: t.status,
        allLabel: t.filterAll,
        primary: true,
        options: [
          { value: "true", label: t.active },
          { value: "false", label: t.inactive },
        ],
      },
      {
        id: "type",
        label: t.bogoPromotionType,
        allLabel: t.filterAll,
        options: typeOptions,
      },
      {
        id: "isRunning",
        label: t.promotionIsRunning,
        allLabel: t.filterAll,
        options: [
          { value: "true", label: t.yes },
          { value: "false", label: t.no },
        ],
      },
      {
        id: "isRequireLogin",
        label: t.promotionIsRequireLogin,
        allLabel: t.filterAll,
        options: [
          { value: "true", label: t.yes },
          { value: "false", label: t.no },
        ],
      },
    ],
    [t, typeOptions],
  );

  const sortDefinitions = useMemo<CrudSortDefinition[]>(
    () => [
      {
        id: "sort",
        label: t.sortBy,
        options: [
          { value: "created_at:desc", label: t.sortNewest },
          { value: "created_at:asc", label: t.sortOldest },
          { value: "priority:desc", label: t.sortPriorityDesc },
          { value: "priority:asc", label: t.sortPriorityAsc },
          { value: "code:asc", label: t.sortCodeAsc },
          { value: "starts_at:desc", label: t.sortStartsAtDesc },
          { value: "ends_at:asc", label: t.promotionSortEndsAtAsc },
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
      type: pick("type"),
      isActive: mapBooleanFilterValue(values.isActive),
      isRequireLogin: mapBooleanFilterValue(values.isRequireLogin),
      isRunning: mapBooleanFilterValue(values.isRunning),
    } satisfies Pick<
      PromotionListParams,
      "type" | "isActive" | "isRequireLogin" | "isRunning"
    >;
  }, []);

  const fetchFn = useCallback(
    (params: PromotionListParams & { page: number; limit: number }, signal?: AbortSignal) =>
      promotionsService.list(params, signal),
    [],
  );

  const list = useServerPaginatedList({
    queryKeyPrefix: "promotions",
    exportPath: "/admin/promotions/export",
    fetchFn,
    limit,
    filterIds: [...FILTER_IDS],
    mapFiltersToParams,
    defaultSort: "created_at:desc",
  });

  return {
    ...list,
    filterDefinitions,
    sortDefinitions,
  };
}
