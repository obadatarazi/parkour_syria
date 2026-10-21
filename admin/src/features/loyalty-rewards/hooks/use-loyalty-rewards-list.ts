import { useCallback, useMemo } from "react";

import { loyaltyRewardsService } from "@/features/loyalty-rewards/services/loyalty-rewards.service";
import type { LoyaltyRewardListParams } from "@/features/loyalty-rewards/types/loyalty-rewards.types";
import {
  type CrudFilterDefinition,
  type CrudSortDefinition,
  mapBooleanFilterValue,
  useServerPaginatedList,
} from "@/shared/crud";
import { CRUD_FILTER_ALL_VALUE } from "@/shared/crud/constants/crud.constants";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { useLoyaltyRewardTypeOptions } from "@/shared/hooks/use-options";

const FILTER_IDS = ["type", "isActive"] as const;

export function useLoyaltyRewardsList(limit = 10) {
  const t = useTranslation();
  const { options: typeOptions } = useLoyaltyRewardTypeOptions();

  const filterDefinitions = useMemo<CrudFilterDefinition[]>(
    () => [
      {
        id: "type",
        label: t.loyaltyRewardType,
        allLabel: t.filterAll,
        primary: true,
        options: typeOptions,
      },
      {
        id: "isActive",
        label: t.status,
        allLabel: t.filterAll,
        options: [
          { value: "true", label: t.active },
          { value: "false", label: t.inactive },
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
          { value: "points_cost:asc", label: t.sortPriorityAsc },
          { value: "points_cost:desc", label: t.sortPriorityDesc },
          { value: "code:asc", label: t.sortCodeAsc },
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
    } satisfies Pick<LoyaltyRewardListParams, "type" | "isActive">;
  }, []);

  const fetchFn = useCallback(
    (params: LoyaltyRewardListParams & { page: number; limit: number }, signal?: AbortSignal) =>
      loyaltyRewardsService.list(params, signal),
    [],
  );

  const list = useServerPaginatedList({
    queryKeyPrefix: "loyalty-rewards",
    exportPath: "/admin/loyalty-rewards/export",
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
