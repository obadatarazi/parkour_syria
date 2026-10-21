import { useCallback, useMemo } from "react";

import { deliveryZonesPricesService } from "@/features/delivery-zones-prices/services/delivery-zones-prices.service";
import type { DeliveryZonesPriceListParams } from "@/features/delivery-zones-prices/types/delivery-zones-prices.types";
import { useStateOptions } from "@/features/states/hooks/use-state-options";
import {
  type CrudFilterDefinition,
  type CrudSortDefinition,
  mapBooleanFilterValue,
  useServerPaginatedList,
} from "@/shared/crud";
import { CRUD_FILTER_ALL_VALUE } from "@/shared/crud/constants/crud.constants";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

const DELIVERY_ZONES_PRICE_FILTER_IDS = ["publish", "stateId"] as const;

export function useDeliveryZonesPricesList(limit = 10) {
  const t = useTranslation();
  const { options: stateOptions } = useStateOptions();

  const filterDefinitions = useMemo<CrudFilterDefinition[]>(
    () => [
      {
        id: "stateId",
        label: t.state,
        allLabel: t.filterAll,
        options: stateOptions,
      },
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
    ],
    [stateOptions, t],
  );

  const sortDefinitions = useMemo<CrudSortDefinition[]>(
    () => [
      {
        id: "sort",
        label: t.sortBy,
        options: [
          { value: "created_at:desc", label: t.sortNewest },
          { value: "created_at:asc", label: t.sortOldest },
          { value: "delivery_fee:asc", label: t.sortDeliveryFeeAsc },
          { value: "delivery_fee:desc", label: t.sortDeliveryFeeDesc },
          { value: "id:desc", label: t.sortIdDesc },
        ],
      },
    ],
    [t],
  );

  const mapFiltersToParams = useCallback((values: Record<string, string>) => {
    const stateId = values.stateId;
    return {
      publish: mapBooleanFilterValue(values.publish),
      stateId: stateId && stateId !== CRUD_FILTER_ALL_VALUE ? Number(stateId) : undefined,
    } satisfies Pick<DeliveryZonesPriceListParams, "publish" | "stateId">;
  }, []);

  const fetchFn = useCallback(
    (params: DeliveryZonesPriceListParams & { page: number; limit: number }, signal?: AbortSignal) =>
      deliveryZonesPricesService.list(params, signal),
    [],
  );

  const list = useServerPaginatedList({
    queryKeyPrefix: "delivery-zones-prices",
    exportPath: "/admin/delivery-zones-prices/export",
    fetchFn,
    limit,
    filterIds: [...DELIVERY_ZONES_PRICE_FILTER_IDS],
    mapFiltersToParams,
    defaultSort: "created_at:desc",
  });

  return {
    ...list,
    filterDefinitions,
    sortDefinitions,
  };
}
