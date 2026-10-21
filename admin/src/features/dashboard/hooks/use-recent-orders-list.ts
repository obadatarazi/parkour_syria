import { useMemo } from "react";

import { DASHBOARD_RECENT_ORDERS_PAGE_SIZE } from "@/features/dashboard/constants/dashboard.constants";
import type { RecentOrder } from "@/features/dashboard/types/dashboard.types";
import { type CrudFilterDefinition, useCrudList } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

const ORDER_FILTER_ID = "status";

export function useRecentOrdersList(orders: RecentOrder[]) {
  const t = useTranslation();

  const filterDefinitions = useMemo<CrudFilterDefinition[]>(
    () => [
      {
        id: ORDER_FILTER_ID,
        label: t.status,
        allLabel: t.filterAll,
        options: [
          { value: "delivered", label: t.delivered },
          { value: "shipped", label: t.shipped },
          { value: "processing", label: t.processing },
          { value: "pending", label: t.pending },
          { value: "cancelled", label: t.cancelled },
        ],
      },
    ],
    [t],
  );

  const list = useCrudList<RecentOrder>({
    items: orders,
    pageSize: DASHBOARD_RECENT_ORDERS_PAGE_SIZE,
    filterIds: [ORDER_FILTER_ID],
    getSearchableValues: (order) => [order.id, order.customerEn, order.customerAr, order.email],
    getFilterValue: (order, filterId) =>
      filterId === ORDER_FILTER_ID ? order.status.value : "",
  });

  return {
    ...list,
    filterDefinitions,
  };
}
