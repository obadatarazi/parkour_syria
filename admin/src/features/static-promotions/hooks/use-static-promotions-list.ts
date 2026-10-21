import { useCallback, useMemo } from "react";

import { staticPromotionsService } from "@/features/static-promotions/services/static-promotions.service";
import type { StaticPromotionListParams } from "@/features/static-promotions/types/static-promotions.types";
import { PROMOTION_POSITION_FILTER_VALUES, type PromotionTypeValue } from "@/shared/constants/promotion-type";
import {
  type CrudFilterDefinition,
  type CrudSortDefinition,
  isActiveFilterValue,
  mapBooleanFilterValue,
  mapIntegerFilterValue,
  useServerPaginatedList,
} from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { useStaticPromotionTypeOptions } from "@/shared/hooks/use-options";

const STATIC_PROMOTION_FILTER_IDS = ["publish", "type", "position"] as const;

export function useStaticPromotionsList(limit = 10) {
  const t = useTranslation();
  const { options: typeOptions } = useStaticPromotionTypeOptions();

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
        id: "type",
        label: t.promotionType,
        allLabel: t.filterAll,
        primary: true,
        options: typeOptions,
      },
      {
        id: "position",
        label: t.position,
        allLabel: t.filterAll,
        primary: true,
        options: PROMOTION_POSITION_FILTER_VALUES.map((value) => ({
          value,
          label: `${t.position} ${value}`,
        })),
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
          { value: "position:asc", label: t.sortPositionAsc },
          { value: "position:desc", label: t.sortPositionDesc },
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
        type: isActiveFilterValue(values.type)
          ? (values.type as PromotionTypeValue)
          : undefined,
        position: mapIntegerFilterValue(values.position),
      }) satisfies Pick<StaticPromotionListParams, "publish" | "type" | "position">,
    [],
  );

  const fetchFn = useCallback(
    (params: StaticPromotionListParams & { page: number; limit: number }, signal?: AbortSignal) =>
      staticPromotionsService.list(params, signal),
    [],
  );

  const list = useServerPaginatedList({
    queryKeyPrefix: "static-promotions",
    exportPath: "/admin/static-promotions/export",
    fetchFn,
    limit,
    filterIds: [...STATIC_PROMOTION_FILTER_IDS],
    mapFiltersToParams,
    defaultSort: "position:asc",
  });

  return {
    ...list,
    filterDefinitions,
    sortDefinitions,
  };
}
