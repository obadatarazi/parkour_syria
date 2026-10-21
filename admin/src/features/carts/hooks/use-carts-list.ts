import { useCallback, useMemo } from "react";

import { cartsService } from "@/features/carts/services/carts.service";
import type { CartListParams } from "@/features/carts/types/carts.types";
import {
  type CrudFilterDefinition,
  type CrudSortDefinition,
  mapBooleanFilterValue,
  mapStringFilterValue,
  useServerPaginatedList,
} from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

const FILTER_IDS = ["conversionStatus", "guest"] as const;

export function useCartsList(limit = 12) {
  const t = useTranslation();

  const filterDefinitions = useMemo<CrudFilterDefinition[]>(
    () => [
      {
        id: "conversionStatus",
        label: t.cartConversionStatus,
        allLabel: t.filterAll,
        primary: true,
        options: [
          { value: "ABANDONED", label: t.cartAbandoned },
          { value: "CONVERTED", label: t.cartConverted },
        ],
      },
      {
        id: "guest",
        label: t.cartAudience,
        allLabel: t.filterAll,
        options: [
          { value: "true", label: t.cartGuest },
          { value: "false", label: t.cartCustomer },
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
          { value: "updated_at:desc", label: t.sortNewest },
          { value: "updated_at:asc", label: t.sortOldest },
          { value: "ordersCount:desc", label: t.cartSortOrdersDesc },
          { value: "purchasedItemsCount:desc", label: t.cartSortItemsDesc },
          { value: "total_price:desc", label: t.cartSortTotalDesc },
          { value: "id:desc", label: t.sortIdDesc },
        ],
      },
    ],
    [t],
  );

  const mapFiltersToParams = useCallback((values: Record<string, string>) => {
    const conversionStatus = mapStringFilterValue(values.conversionStatus);
    return {
      conversionStatus:
        conversionStatus === "ABANDONED" || conversionStatus === "CONVERTED"
          ? conversionStatus
          : undefined,
      guest: mapBooleanFilterValue(values.guest),
    } satisfies Pick<CartListParams, "conversionStatus" | "guest">;
  }, []);

  const fetchFn = useCallback(
    (params: CartListParams & { page: number; limit: number }, signal?: AbortSignal) =>
      cartsService.list(params, signal),
    [],
  );

  const list = useServerPaginatedList({
    queryKeyPrefix: "carts",
    fetchFn,
    limit,
    filterIds: [...FILTER_IDS],
    mapFiltersToParams,
    defaultSort: "updated_at:desc",
  });

  return {
    ...list,
    filterDefinitions,
    sortDefinitions,
  };
}
