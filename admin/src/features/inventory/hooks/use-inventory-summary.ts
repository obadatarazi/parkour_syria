import { useCallback, useMemo } from "react";

import { inventoryService } from "@/features/inventory/services/inventory.service";
import type { InventoryListParams } from "@/features/inventory/services/inventory.service.types";
import type { InventorySummary } from "@/features/inventory/types/inventory.types";
import { useCrudQuery } from "@/shared/crud/hooks/use-crud-query";

export const INVENTORY_SUMMARY_QUERY_PREFIX = "inventory-summary";

export type InventorySummaryCriteria = Pick<
  InventoryListParams,
  "search" | "publish" | "sort" | "direction"
>;

export function buildInventorySummaryApiParamsSignature(
  criteria: InventorySummaryCriteria,
): string {
  return JSON.stringify({
    search: criteria.search?.trim() || undefined,
    publish: criteria.publish,
    sort: criteria.sort,
    direction: criteria.direction,
  });
}

export function buildInventorySummaryQueryKey(
  criteria: InventorySummaryCriteria,
  language: string,
): string[] {
  return [
    INVENTORY_SUMMARY_QUERY_PREFIX,
    buildInventorySummaryApiParamsSignature(criteria),
    language,
  ];
}

type UseInventorySummaryOptions = {
  enabled?: boolean;
};

export function useInventorySummary(
  criteria: InventorySummaryCriteria,
  options?: UseInventorySummaryOptions,
) {
  const apiParamsSignature = useMemo(
    () => buildInventorySummaryApiParamsSignature(criteria),
    [criteria],
  );

  const queryKey = useMemo(
    () => [INVENTORY_SUMMARY_QUERY_PREFIX, apiParamsSignature],
    [apiParamsSignature],
  );

  const queryFn = useCallback(
    (signal?: AbortSignal) => inventoryService.summary(criteria, signal),
    [criteria],
  );

  return useCrudQuery<InventorySummary>({
    queryKey,
    queryFn,
    enabled: options?.enabled ?? true,
  });
}
