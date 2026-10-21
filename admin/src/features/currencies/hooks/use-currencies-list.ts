import { useCallback, useMemo } from "react";

import { currenciesService } from "@/features/currencies/services/currencies.service";
import type { CurrencyListParams } from "@/features/currencies/types/currencies.types";
import {
  type CrudFilterDefinition,
  type CrudSortDefinition,
  mapBooleanFilterValue,
  useServerPaginatedList,
} from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

const CURRENCY_FILTER_IDS = ["publish", "isDefault"] as const;

export function useCurrenciesList(limit = 10) {
  const t = useTranslation();

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
        id: "isDefault",
        label: t.defaultCurrency,
        allLabel: t.filterAll,
        options: [
          { value: "true", label: t.defaultCurrency },
          { value: "false", label: t.notDefaultCurrency },
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
          { value: "created_at:desc", label: t.sortNewest },
          { value: "created_at:asc", label: t.sortOldest },
          { value: "code:asc", label: t.sortCodeAsc },
          { value: "code:desc", label: t.sortCodeDesc },
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
        isDefault: mapBooleanFilterValue(values.isDefault),
      }) satisfies Pick<CurrencyListParams, "publish" | "isDefault">,
    [],
  );

  const fetchFn = useCallback(
    (params: CurrencyListParams & { page: number; limit: number }, signal?: AbortSignal) =>
      currenciesService.list(params, signal),
    [],
  );

  const list = useServerPaginatedList({
    queryKeyPrefix: "currencies",
    exportPath: "/admin/currencies/export",
    fetchFn,
    limit,
    filterIds: [...CURRENCY_FILTER_IDS],
    mapFiltersToParams,
    defaultSort: "created_at:desc",
  });

  return {
    ...list,
    filterDefinitions,
    sortDefinitions,
  };
}
