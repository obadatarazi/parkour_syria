import { useCallback, useEffect, useMemo, useState } from "react";

import {
  EMPTY_INVENTORY_SUMMARY,
  INVENTORY_STOCK_STATUS_FILTER_ID,
  INVENTORY_STOCK_STATUS_TO_API,
} from "@/features/inventory/constants/inventory.constants";
import {
  buildInventorySummaryQueryKey,
  useInventorySummary,
} from "@/features/inventory/hooks/use-inventory-summary";
import { inventoryService } from "@/features/inventory/services/inventory.service";
import type { InventoryListParams } from "@/features/inventory/services/inventory.service.types";
import type { InventorySummary, StockStatus } from "@/features/inventory/types/inventory.types";
import type { Product } from "@/features/products/types/products.types";
import {
  filterInventoryRows,
  flattenProductVariants,
} from "@/features/inventory/utils/flatten-product-variants";
import {
  type CrudFilterDefinition,
  mapBooleanFilterValue,
  useServerPaginatedList,
} from "@/shared/crud";
import { CRUD_FILTER_ALL_VALUE } from "@/shared/crud/constants/crud.constants";
import { setCachedQueryData } from "@/shared/crud/query-cache";
import {
  useLocalization,
  useTranslation,
} from "@/shared/design-system/localization/contexts/LocalizationContext";
import { useUrlSearchParam } from "@/shared/hooks/use-url-search-param";

const INVENTORY_FILTER_IDS = ["publish"] as const;

function mapStockStatusFilterValue(
  value: string | undefined,
): InventoryListParams["stockStatus"] | undefined {
  if (!value || value === CRUD_FILTER_ALL_VALUE) return undefined;
  if (value === "in" || value === "low" || value === "out") {
    return INVENTORY_STOCK_STATUS_TO_API[value];
  }
  return undefined;
}

export function useInventoryList(limit = 12) {
  const t = useTranslation();
  const { language } = useLocalization();
  const initialSearch = useUrlSearchParam();

  const filterDefinitions = useMemo<CrudFilterDefinition[]>(
    () => [
      {
        id: INVENTORY_STOCK_STATUS_FILTER_ID,
        label: t.stock,
        allLabel: t.filterAll,
        primary: true,
        options: [
          { value: "in", label: t.inStock },
          { value: "low", label: t.lowStockCount },
          { value: "out", label: t.outOfStock },
        ],
      },
      {
        id: "publish",
        label: t.status,
        allLabel: t.filterAll,
        options: [
          { value: "true", label: t.active },
          { value: "false", label: t.inactive },
        ],
      },
    ],
    [t],
  );

  const mapFiltersToParams = useCallback(
    (values: Record<string, string>) =>
      ({
        publish: mapBooleanFilterValue(values.publish),
        stockStatus: mapStockStatusFilterValue(values[INVENTORY_STOCK_STATUS_FILTER_ID]),
      }) satisfies Pick<InventoryListParams, "publish" | "stockStatus">,
    [],
  );

  const [pageOneSummary, setPageOneSummary] = useState<InventorySummary | undefined>();

  const fetchFn = useCallback(
    async (params: InventoryListParams & { page: number; limit: number }, signal?: AbortSignal) => {
      const result = await inventoryService.list(params, signal);
      if (params.page === 1) {
        setPageOneSummary(result.summary);
      }
      return {
        data: result.data,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
      };
    },
    [],
  );

  const list = useServerPaginatedList<Product>({
    queryKeyPrefix: "inventory-products",
    exportPath: "/admin/products/export",
    fetchFn,
    limit,
    filterIds: [...INVENTORY_FILTER_IDS, INVENTORY_STOCK_STATUS_FILTER_ID],
    mapFiltersToParams,
    defaultSort: "created_at:desc",
    initialSearch,
  });

  const summaryCriteria = useMemo(
    () => ({
      search: list.debouncedSearch.trim() || undefined,
      publish: list.filterParams.publish as boolean | undefined,
      sort: list.sortParams.sort,
      direction: list.sortParams.direction,
    }),
    [
      list.debouncedSearch,
      list.filterParams.publish,
      list.sortParams.direction,
      list.sortParams.sort,
    ],
  );

  const summaryQuery = useInventorySummary(summaryCriteria, {
    enabled: list.page > 1,
  });

  useEffect(() => {
    if (list.page !== 1 || !pageOneSummary) return;
    setCachedQueryData(buildInventorySummaryQueryKey(summaryCriteria, language), pageOneSummary);
  }, [language, list.page, pageOneSummary, summaryCriteria]);

  const allRows = useMemo(() => flattenProductVariants(list.items), [list.items]);
  const stockStatusFilter = list.filters.values[INVENTORY_STOCK_STATUS_FILTER_ID];
  const stockStatus =
    stockStatusFilter === CRUD_FILTER_ALL_VALUE
      ? null
      : (stockStatusFilter as StockStatus);

  // Client-side row trim for variable products with mixed SKU stock on the same product.
  const filteredRows = useMemo(
    () => filterInventoryRows(allRows, stockStatus, list.search),
    [allRows, stockStatus, list.search],
  );

  const summary = useMemo(() => {
    if (list.page === 1 && pageOneSummary) {
      return pageOneSummary;
    }
    return summaryQuery.data ?? EMPTY_INVENTORY_SUMMARY;
  }, [list.page, pageOneSummary, summaryQuery.data]);

  const refetch = useCallback(async () => {
    await list.refetch();
    if (list.page > 1) {
      await summaryQuery.refetch();
    }
  }, [list.page, list.refetch, summaryQuery.refetch]);

  return {
    ...list,
    rows: filteredRows,
    summary,
    filterDefinitions,
    refetch,
  };
}
