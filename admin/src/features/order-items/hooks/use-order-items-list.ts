import { useCallback, useMemo } from "react";

import { orderItemsService } from "@/features/order-items/services/order-items.service";
import type { OrderItemListParams } from "@/features/order-items/types/order-items.types";
import { type CrudSortDefinition, useServerPaginatedList } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

export function useOrderItemsList(limit = 20) {
  const t = useTranslation();

  const sortDefinitions = useMemo<CrudSortDefinition[]>(
    () => [
      {
        id: "sort",
        label: t.sortBy,
        options: [
          { value: "created_at:desc", label: t.sortNewest },
          { value: "created_at:asc", label: t.sortOldest },
          { value: "product_title:asc", label: t.sortProductTitleAsc },
          { value: "product_title:desc", label: t.sortProductTitleDesc },
          { value: "quantity:desc", label: t.sortQuantityDesc },
          { value: "quantity:asc", label: t.sortQuantityAsc },
          { value: "sub_total_price:desc", label: t.sortSubTotalDesc },
          { value: "sub_total_price:asc", label: t.sortSubTotalAsc },
          { value: "price:desc", label: t.sortPriceDesc },
          { value: "price:asc", label: t.sortPriceAsc },
          { value: "id:desc", label: t.sortIdDesc },
        ],
      },
    ],
    [t],
  );

  const fetchFn = useCallback(
    (params: OrderItemListParams & { page: number; limit: number }, signal?: AbortSignal) =>
      orderItemsService.list(params, signal),
    [],
  );

  const list = useServerPaginatedList({
    queryKeyPrefix: "order-items",
    exportPath: "/admin/order-items/export",
    fetchFn,
    limit,
    defaultSort: "created_at:desc",
  });

  return {
    ...list,
    sortDefinitions,
  };
}
