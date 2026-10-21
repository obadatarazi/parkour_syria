import { useCallback, useEffect } from "react";

import { getRouteNavAccess } from "@/app/router/route-permissions";
import { ROUTES } from "@/app/router/routes";
import { canAccessNavItem, useAbility } from "@/features/auth";
import { ordersService } from "@/features/orders/services/orders.service";
import type { OrderStats } from "@/features/orders/types/orders.types";
import {
  subscribeQueryCacheInvalidation,
  useCrudQuery,
} from "@/shared/crud";

/** How often the sidebar re-checks for new actionable orders while the admin is idle. */
const POLL_INTERVAL_MS = 60_000;

/** Fresh enough for a badge; still avoids hammering the API on every focus. */
const STATS_STALE_TIME_MS = 30_000;

const ORDERS_NAV_ACCESS = getRouteNavAccess(ROUTES.admin.orders);

/**
 * Count of orders that still need staff action (PROCESSING + READY_TO_PREPARE).
 * Used for the Orders sidebar badge.
 */
export function useOrderNeedsActionCount(): number {
  const ability = useAbility();
  const canViewOrders = canAccessNavItem(ability, ORDERS_NAV_ACCESS);

  const queryFn = useCallback(
    (signal?: AbortSignal) => ordersService.getStats(signal),
    [],
  );

  const { data, refetch } = useCrudQuery<OrderStats>({
    queryKey: ["orders", "stats"],
    queryFn,
    enabled: canViewOrders,
    staleTime: STATS_STALE_TIME_MS,
  });

  useEffect(() => {
    if (!canViewOrders) return;

    const onInvalidate = (prefix: string | undefined) => {
      if (prefix === undefined || prefix === "orders") {
        void refetch();
      }
    };

    const unsubscribe = subscribeQueryCacheInvalidation(onInvalidate);
    return unsubscribe;
  }, [canViewOrders, refetch]);

  useEffect(() => {
    if (!canViewOrders) return;

    const poll = window.setInterval(() => {
      void refetch();
    }, POLL_INTERVAL_MS);

    const onFocus = () => {
      void refetch();
    };
    window.addEventListener("focus", onFocus);

    return () => {
      window.clearInterval(poll);
      window.removeEventListener("focus", onFocus);
    };
  }, [canViewOrders, refetch]);

  return data?.needsActionCount && data.needsActionCount > 0
    ? data.needsActionCount
    : 0;
}
