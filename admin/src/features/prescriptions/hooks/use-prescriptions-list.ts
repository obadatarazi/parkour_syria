import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";

import { prescriptionsService } from "@/features/prescriptions/services/prescriptions.service";
import type { PrescriptionListParams } from "@/features/prescriptions/types/prescriptions.types";
import {
  type CrudFilterDefinition,
  type CrudSortDefinition,
  useServerPaginatedList,
} from "@/shared/crud";
import { CRUD_FILTER_ALL_VALUE } from "@/shared/crud/constants/crud.constants";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { usePrescriptionStatusOptions } from "@/shared/hooks/use-options";

const PRESCRIPTION_FILTER_IDS = ["status"] as const;

export function usePrescriptionsList(limit = 10) {
  const t = useTranslation();
  const [searchParams] = useSearchParams();
  const userIdParam = searchParams.get("userId");
  const userId =
    userIdParam && Number.isFinite(Number(userIdParam)) && Number(userIdParam) > 0
      ? Number(userIdParam)
      : undefined;
  const { options: statusOptions } = usePrescriptionStatusOptions();

  const filterDefinitions = useMemo<CrudFilterDefinition[]>(
    () => [
      {
        id: "status",
        label: t.status,
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
          { value: "prescription_number:asc", label: t.prescriptionNumber },
          { value: "status:asc", label: t.status },
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
    } satisfies Pick<PrescriptionListParams, "status">;
  }, []);

  const fetchFn = useCallback(
    (params: PrescriptionListParams & { page: number; limit: number }, signal?: AbortSignal) =>
      prescriptionsService.list({ ...params, userId }, signal),
    [userId],
  );

  const list = useServerPaginatedList({
    queryKeyPrefix: "prescriptions",
    exportPath: "/admin/prescriptions/export",
    fetchFn,
    limit,
    filterIds: [...PRESCRIPTION_FILTER_IDS],
    mapFiltersToParams,
    defaultSort: "created_at:desc",
  });

  return {
    ...list,
    filterDefinitions,
    sortDefinitions,
    statusOptions,
  };
}
