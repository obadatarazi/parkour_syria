import { useCallback, useMemo } from "react";

import { couponsService } from "@/features/coupons/services/coupons.service";
import type { CouponListParams } from "@/features/coupons/types/coupons.types";
import {
  type CrudFilterDefinition,
  type CrudSortDefinition,
  mapBooleanFilterValue,
  useServerPaginatedList,
} from "@/shared/crud";
import { CRUD_FILTER_ALL_VALUE } from "@/shared/crud/constants/crud.constants";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import {
  useCouponAudienceOptions,
  useCouponScopeOptions,
  useCouponStatusOptions,
  useCouponTypeOptions,
} from "@/shared/hooks/use-options";

const COUPON_FILTER_IDS = ["type", "scope", "status", "audience", "isAutoApply", "isAdminOnly"] as const;

export function useCouponsList(limit = 10) {
  const t = useTranslation();
  const { options: typeOptions } = useCouponTypeOptions();
  const { options: scopeOptions } = useCouponScopeOptions();
  const { options: statusOptions } = useCouponStatusOptions();
  const { options: audienceOptions } = useCouponAudienceOptions();

  const filterDefinitions = useMemo<CrudFilterDefinition[]>(
    () => [
      {
        id: "status",
        label: t.status,
        allLabel: t.filterAll,
        primary: true,
        options: statusOptions,
      },
      {
        id: "type",
        label: t.couponType,
        allLabel: t.filterAll,
        options: typeOptions,
      },
      {
        id: "scope",
        label: t.couponScope,
        allLabel: t.filterAll,
        options: scopeOptions,
      },
      {
        id: "audience",
        label: t.couponAudience,
        allLabel: t.filterAll,
        options: audienceOptions,
      },
      {
        id: "isAutoApply",
        label: t.couponIsAutoApply,
        allLabel: t.filterAll,
        options: [
          { value: "true", label: t.yes },
          { value: "false", label: t.no },
        ],
      },
      {
        id: "isAdminOnly",
        label: t.couponIsAdminOnly,
        allLabel: t.filterAll,
        options: [
          { value: "true", label: t.yes },
          { value: "false", label: t.no },
        ],
      },
    ],
    [audienceOptions, scopeOptions, statusOptions, t, typeOptions],
  );

  const sortDefinitions = useMemo<CrudSortDefinition[]>(
    () => [
      {
        id: "sort",
        label: t.sortBy,
        options: [
          { value: "created_at:desc", label: t.sortNewest },
          { value: "created_at:asc", label: t.sortOldest },
          { value: "priority:asc", label: t.sortPriorityAsc },
          { value: "priority:desc", label: t.sortPriorityDesc },
          { value: "code:asc", label: t.sortCodeAsc },
          { value: "starts_at:desc", label: t.sortStartsAtDesc },
          { value: "expire_at:asc", label: t.sortExpireAtAsc },
          { value: "id:desc", label: t.sortIdDesc },
        ],
      },
    ],
    [t],
  );

  const mapFiltersToParams = useCallback((values: Record<string, string>) => {
    const pick = (key: string) =>
      values[key] && values[key] !== CRUD_FILTER_ALL_VALUE ? values[key] : undefined;

    return {
      type: pick("type"),
      scope: pick("scope"),
      status: pick("status"),
      audience: pick("audience"),
      isAutoApply: mapBooleanFilterValue(values.isAutoApply),
      isAdminOnly: mapBooleanFilterValue(values.isAdminOnly),
    } satisfies Pick<
      CouponListParams,
      "type" | "scope" | "status" | "audience" | "isAutoApply" | "isAdminOnly"
    >;
  }, []);

  const fetchFn = useCallback(
    (params: CouponListParams & { page: number; limit: number }, signal?: AbortSignal) =>
      couponsService.list(params, signal),
    [],
  );

  const list = useServerPaginatedList({
    queryKeyPrefix: "coupons",
    exportPath: "/admin/coupons/export",
    fetchFn,
    limit,
    filterIds: [...COUPON_FILTER_IDS],
    mapFiltersToParams,
    defaultSort: "created_at:desc",
  });

  return {
    ...list,
    filterDefinitions,
    sortDefinitions,
  };
}
