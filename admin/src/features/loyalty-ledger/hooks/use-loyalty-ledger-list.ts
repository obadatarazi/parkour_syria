import { useCallback, useMemo } from "react";

import { loyaltyLedgerService } from "@/features/loyalty-ledger/services/loyalty-ledger.service";
import type { LoyaltyLedgerListParams } from "@/features/loyalty-ledger/types/loyalty-ledger.types";
import {
  type CrudFilterDefinition,
  type CrudSortDefinition,
  mapIntegerFilterValue,
  mapStringFilterValue,
  useServerPaginatedList,
} from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { useLoyaltyLedgerTypeOptions } from "@/shared/hooks/use-options";

const FILTER_IDS = [
  "type",
  "userId",
  "loyaltyEventId",
  "loyaltyRewardId",
  "orderId",
] as const;

export function useLoyaltyLedgerList(limit = 12) {
  const t = useTranslation();
  const { options: typeOptions } = useLoyaltyLedgerTypeOptions();

  const filterDefinitions = useMemo<CrudFilterDefinition[]>(
    () => [
      {
        id: "type",
        label: t.loyaltyLedgerType,
        allLabel: t.filterAll,
        primary: true,
        options: typeOptions,
      },
    ],
    [t, typeOptions],
  );

  const sortDefinitions = useMemo<CrudSortDefinition[]>(
    () => [
      {
        id: "sort",
        label: t.sortBy,
        options: [
          { value: "created_at:desc", label: t.sortNewest },
          { value: "created_at:asc", label: t.sortOldest },
          { value: "points:desc", label: t.sortPriorityDesc },
          { value: "points:asc", label: t.sortPriorityAsc },
          { value: "balance_after:desc", label: t.loyaltyLedgerBalanceAfter },
          { value: "id:desc", label: t.sortIdDesc },
        ],
      },
    ],
    [t],
  );

  const mapFiltersToParams = useCallback(
    (values: Record<string, string>) =>
      ({
        type: mapStringFilterValue(values.type),
        userId: mapIntegerFilterValue(values.userId),
        loyaltyEventId: mapIntegerFilterValue(values.loyaltyEventId),
        loyaltyRewardId: mapIntegerFilterValue(values.loyaltyRewardId),
        orderId: mapIntegerFilterValue(values.orderId),
      }) satisfies Pick<
        LoyaltyLedgerListParams,
        "type" | "userId" | "loyaltyEventId" | "loyaltyRewardId" | "orderId"
      >,
    [],
  );

  const fetchFn = useCallback(
    (params: LoyaltyLedgerListParams & { page: number; limit: number }, signal?: AbortSignal) =>
      loyaltyLedgerService.list(params, signal),
    [],
  );

  const list = useServerPaginatedList({
    queryKeyPrefix: "loyalty-ledger",
    exportPath: "/admin/loyalty-ledger/export",
    fetchFn,
    limit,
    filterIds: [...FILTER_IDS],
    mapFiltersToParams,
    defaultSort: "created_at:desc",
  });

  return {
    ...list,
    filterDefinitions,
    sortDefinitions,
    idFilterIds: ["userId", "loyaltyEventId", "loyaltyRewardId", "orderId"] as const,
  };
}
