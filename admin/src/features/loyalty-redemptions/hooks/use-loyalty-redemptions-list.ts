import { useCallback, useMemo } from "react";

import { loyaltyRedemptionsService } from "@/features/loyalty-redemptions/services/loyalty-redemptions.service";
import type { LoyaltyRedemptionListParams } from "@/features/loyalty-redemptions/types/loyalty-redemptions.types";
import {
  type CrudFilterDefinition,
  type CrudSortDefinition,
  mapIntegerFilterValue,
  mapStringFilterValue,
  useServerPaginatedList,
} from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { useLoyaltyRedemptionStatusOptions } from "@/shared/hooks/use-options";

const FILTER_IDS = ["status", "userId", "loyaltyRewardId"] as const;

export function useLoyaltyRedemptionsList(limit = 12) {
  const t = useTranslation();
  const { options: statusOptions } = useLoyaltyRedemptionStatusOptions();

  const filterDefinitions = useMemo<CrudFilterDefinition[]>(
    () => [
      {
        id: "status",
        label: t.loyaltyRedemptionStatus,
        allLabel: t.filterAll,
        primary: true,
        options: statusOptions,
      },
    ],
    [statusOptions, t],
  );

  const sortDefinitions = useMemo<CrudSortDefinition[]>(
    () => [
      {
        id: "sort",
        label: t.sortBy,
        options: [
          { value: "created_at:desc", label: t.sortNewest },
          { value: "created_at:asc", label: t.sortOldest },
          { value: "redeemed_at:desc", label: t.loyaltyRedemptionRedeemedAt },
          { value: "expires_at:asc", label: t.loyaltyRedemptionExpiresAt },
          { value: "points:desc", label: t.sortPriorityDesc },
          { value: "id:desc", label: t.sortIdDesc },
        ],
      },
    ],
    [t],
  );

  const mapFiltersToParams = useCallback(
    (values: Record<string, string>) =>
      ({
        status: mapStringFilterValue(values.status),
        userId: mapIntegerFilterValue(values.userId),
        loyaltyRewardId: mapIntegerFilterValue(values.loyaltyRewardId),
      }) satisfies Pick<LoyaltyRedemptionListParams, "status" | "userId" | "loyaltyRewardId">,
    [],
  );

  const fetchFn = useCallback(
    (
      params: LoyaltyRedemptionListParams & { page: number; limit: number },
      signal?: AbortSignal,
    ) => loyaltyRedemptionsService.list(params, signal),
    [],
  );

  const list = useServerPaginatedList({
    queryKeyPrefix: "loyalty-redemptions",
    exportPath: "/admin/loyalty-redemptions/export",
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
    idFilterIds: ["userId", "loyaltyRewardId"] as const,
  };
}
