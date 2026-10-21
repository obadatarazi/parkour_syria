import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";

import { carePlansService } from "@/features/care-plans/services/care-plans.service";
import type { CarePlanListParams } from "@/features/care-plans/types/care-plans.types";
import {
  type CrudFilterDefinition,
  type CrudSortDefinition,
  useServerPaginatedList,
} from "@/shared/crud";
import { CRUD_FILTER_ALL_VALUE } from "@/shared/crud/constants/crud.constants";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import {
  useCarePlanFrequencyOptions,
  useCarePlanStatusOptions,
} from "@/shared/hooks/use-options";

const CARE_PLAN_FILTER_IDS = ["status", "frequency"] as const;

export function useCarePlansList(limit = 10) {
  const t = useTranslation();
  const [searchParams] = useSearchParams();
  const userIdParam = searchParams.get("userId");
  const userId =
    userIdParam && Number.isFinite(Number(userIdParam)) && Number(userIdParam) > 0
      ? Number(userIdParam)
      : undefined;
  const { options: statusOptions } = useCarePlanStatusOptions();
  const { options: frequencyOptions } = useCarePlanFrequencyOptions();

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
        id: "frequency",
        label: t.carePlanFrequency,
        allLabel: t.filterAll,
        options: frequencyOptions,
      },
    ],
    [frequencyOptions, statusOptions, t],
  );

  const sortDefinitions = useMemo<CrudSortDefinition[]>(
    () => [
      {
        id: "sort",
        label: t.sortBy,
        options: [
          { value: "created_at:desc", label: t.sortNewest },
          { value: "created_at:asc", label: t.sortOldest },
          { value: "next_delivery_at:asc", label: t.carePlanSortNextDeliveryAsc },
          { value: "next_delivery_at:desc", label: t.carePlanSortNextDeliveryDesc },
          { value: "status:asc", label: t.carePlanSortStatusAsc },
          { value: "frequency:asc", label: t.carePlanSortFrequencyAsc },
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
      status: pick("status"),
      frequency: pick("frequency"),
    } satisfies Pick<CarePlanListParams, "status" | "frequency">;
  }, []);

  const fetchFn = useCallback(
    (params: CarePlanListParams & { page: number; limit: number }, signal?: AbortSignal) =>
      carePlansService.list({ ...params, userId }, signal),
    [userId],
  );

  const list = useServerPaginatedList({
    queryKeyPrefix: "care-plans",
    exportPath: "/admin/care-plans/export",
    fetchFn,
    limit,
    filterIds: [...CARE_PLAN_FILTER_IDS],
    mapFiltersToParams,
    defaultSort: "created_at:desc",
  });

  return {
    ...list,
    filterDefinitions,
    sortDefinitions,
  };
}
