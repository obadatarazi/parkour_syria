import { useMemo } from "react";

import { notificationRoutesService } from "@/features/notification-routes/services/notification-routes.service";
import type { NotificationRoute } from "@/features/notification-routes/types/notification-routes.types";
import { useCrudQuery, useCrudSearch } from "@/shared/crud";
import { applyClientSearch } from "@/shared/crud/utils/search.utils";
import type { LaravelEnumOption } from "@/shared/lib/api";
import { fetchEnumOptions, OPTIONS_ENDPOINTS } from "@/shared/services/options-api.service";

type NotificationRoutesListState = {
  items: NotificationRoute[];
  allItems: NotificationRoute[];
  search: string;
  setSearch: (value: string) => void;
  resetSearch: () => void;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
};

function normalizeEventOptions(options: LaravelEnumOption[]): LaravelEnumOption[] {
  return options
    .map((option) => ({
      label: option.label,
      value: option.value,
    }))
    .filter((option) => option.value != null && option.value !== "");
}

export function useNotificationRoutesList(): NotificationRoutesListState {
  const search = useCrudSearch();

  const routesQuery = useCrudQuery({
    queryKey: ["notification-routes", "routes"],
    queryFn: (signal) => notificationRoutesService.list(signal),
  });

  const eventsQuery = useCrudQuery({
    queryKey: ["notification-routes", "events"],
    queryFn: async (signal) => {
      const response = await fetchEnumOptions(OPTIONS_ENDPOINTS.adminNotificationEvents, signal);
      return normalizeEventOptions(response);
    },
  });

  const allItems = useMemo(() => {
    const events = eventsQuery.data ?? [];
    const routesByEvent = new Map((routesQuery.data ?? []).map((route) => [route.event.value, route]));
    const merged = events.map((event) => {
      const existing = routesByEvent.get(event.value);
      if (existing) {
        return {
          ...existing,
          event: {
            label: event.label || existing.event.label,
            value: event.value,
          },
        };
      }

      return {
        id: event.value,
        event: {
          label: event.label,
          value: event.value,
        },
        recipients: [],
      };
    });

    for (const route of routesQuery.data ?? []) {
      if (merged.some((item) => item.event.value === route.event.value)) continue;
      merged.push(route);
    }

    return merged;
  }, [eventsQuery.data, routesQuery.data]);

  const items = useMemo(
    () =>
      applyClientSearch(allItems, search.debouncedSearch, (item) => [
        item.event.label,
        item.event.value,
      ]),
    [allItems, search.debouncedSearch],
  );

  return {
    items,
    allItems,
    search: search.search,
    setSearch: search.setSearch,
    resetSearch: search.resetSearch,
    isLoading: routesQuery.isLoading || eventsQuery.isLoading,
    isError: routesQuery.isError || eventsQuery.isError,
    error: routesQuery.error ?? eventsQuery.error,
    refetch: async () => {
      await Promise.all([routesQuery.refetch(), eventsQuery.refetch()]);
    },
  };
}
