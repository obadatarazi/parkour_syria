import { useEffect, useMemo, useState } from "react";

import { deliveryZonesPricesService } from "@/features/delivery-zones-prices/services/delivery-zones-prices.service";
import type { DeliveryZonesPrice } from "@/features/delivery-zones-prices/types/delivery-zones-prices.types";
import { formatKwd } from "@/features/products/utils/product-display.utils";
import { useCrudQuery, useDebouncedValue } from "@/shared/crud";
import {
  formatBilingualLabel,
  getBilingualTitle,
} from "@/shared/lib/translation-display.utils";

const DELIVERY_ZONE_PICKER_PAGE_SIZE = 20;

export function getOrderDeliveryZoneLabel(zone: DeliveryZonesPrice): string {
  const stateLabel = zone.state
    ? formatBilingualLabel(getBilingualTitle(zone.state.translations, zone.state.title))
    : `#${zone.id}`;
  return `${stateLabel} · ${formatKwd(zone.deliveryFee)}`;
}

type UseOrderDeliveryZonePickerOptions = {
  selectedId: number | null;
  enabled?: boolean;
  active?: boolean;
};

export function useOrderDeliveryZonePicker({
  selectedId,
  enabled = true,
  active = false,
}: UseOrderDeliveryZonePickerOptions) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 200);

  const listQuery = useCrudQuery({
    queryKey: [
      "delivery-zones-prices",
      "order-picker",
      debouncedSearch,
      String(page),
    ],
    queryFn: (signal) =>
      deliveryZonesPricesService.list(
        {
          page,
          limit: DELIVERY_ZONE_PICKER_PAGE_SIZE,
          search: debouncedSearch.trim() || undefined,
          publish: true,
          sort: "created_at",
          direction: "desc",
        },
        signal,
      ),
    enabled: enabled && (active || selectedId != null),
  });

  const zones = listQuery.data?.data ?? [];

  const selectedOnPage = useMemo(() => {
    if (selectedId == null) return null;
    return zones.find((zone) => zone.id === selectedId) ?? null;
  }, [selectedId, zones]);

  const selectedZoneQuery = useCrudQuery({
    queryKey: ["delivery-zones-prices", "order-picker", "selected", String(selectedId ?? "")],
    queryFn: async (signal) => {
      if (selectedId == null) return null;
      return deliveryZonesPricesService.getById(selectedId, signal);
    },
    enabled: enabled && selectedId != null && selectedOnPage == null,
  });

  const selectedZone = useMemo(() => {
    if (selectedId == null) return null;
    if (selectedOnPage) return selectedOnPage;
    if (selectedZoneQuery.data?.id === selectedId) return selectedZoneQuery.data;
    return null;
  }, [selectedId, selectedOnPage, selectedZoneQuery.data]);

  const totalPages = listQuery.data
    ? Math.max(1, Math.ceil(listQuery.data.total / listQuery.data.pageSize))
    : 1;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  return {
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    zones,
    selectedZone,
    isLoading: listQuery.isLoading || listQuery.isFetching,
    isError: listQuery.isError,
    error: listQuery.error,
    refetch: listQuery.refetch,
  };
}
