import { useCallback, useMemo } from "react";

import { promotionUsagesService } from "@/features/promotions/services/promotion-usages.service";
import type { PromotionUsageListParams } from "@/features/promotions/types/promotions.types";
import {
  type CrudFilterDefinition,
  type CrudSortDefinition,
  mapIntegerFilterValue,
  mapStringFilterValue,
  useServerPaginatedList,
} from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

const FILTER_IDS = ["promotionId", "userId", "orderId", "code"] as const;

export function usePromotionUsagesList(limit = 12) {
  const t = useTranslation();

  const filterDefinitions = useMemo<CrudFilterDefinition[]>(() => [], []);

  const sortDefinitions = useMemo<CrudSortDefinition[]>(
    () => [
      {
        id: "sort",
        label: t.sortBy,
        options: [
          { value: "used_at:desc", label: t.promotionSortUsedAtDesc },
          { value: "used_at:asc", label: t.promotionSortUsedAtAsc },
          { value: "created_at:desc", label: t.sortNewest },
          { value: "created_at:asc", label: t.sortOldest },
          { value: "price_promotions:desc", label: t.promotionSortGivenAwayDesc },
          { value: "code:asc", label: t.sortCodeAsc },
          { value: "id:desc", label: t.sortIdDesc },
        ],
      },
    ],
    [t],
  );

  const mapFiltersToParams = useCallback((values: Record<string, string>) => {
    return {
      promotionId: mapIntegerFilterValue(values.promotionId),
      userId: mapIntegerFilterValue(values.userId),
      orderId: mapIntegerFilterValue(values.orderId),
      code: mapStringFilterValue(values.code),
    } satisfies Pick<
      PromotionUsageListParams,
      "promotionId" | "userId" | "orderId" | "code"
    >;
  }, []);

  const fetchFn = useCallback(
    (
      params: PromotionUsageListParams & { page: number; limit: number },
      signal?: AbortSignal,
    ) => promotionUsagesService.list(params, signal),
    [],
  );

  const list = useServerPaginatedList({
    queryKeyPrefix: "promotion-usages",
    fetchFn,
    limit,
    filterIds: [...FILTER_IDS],
    mapFiltersToParams,
    defaultSort: "used_at:desc",
  });

  return {
    ...list,
    filterDefinitions,
    sortDefinitions,
    idFilterIds: ["promotionId", "userId", "orderId"] as const,
  };
}
