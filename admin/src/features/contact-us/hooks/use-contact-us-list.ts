import { useCallback, useMemo } from "react";

import { contactUsService } from "@/features/contact-us/services/contact-us.service";
import type { ContactUsListParams } from "@/features/contact-us/types/contact-us.types";
import {
  type CrudFilterDefinition,
  type CrudSortDefinition,
  mapStringFilterValue,
  useServerPaginatedList,
} from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { useContactUsStatusOptions } from "@/shared/hooks/use-options";

const CONTACT_US_FILTER_IDS = ["status"] as const;

export function useContactUsList(limit = 20) {
  const t = useTranslation();
  const { options: statusOptions } = useContactUsStatusOptions();

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
          { value: "id:desc", label: t.sortIdDesc },
        ],
      },
    ],
    [t],
  );

  const mapFiltersToParams = useCallback(
    (values: Record<string, string>) =>
      ({
        status: mapStringFilterValue(values.status) as ContactUsListParams["status"] | undefined,
      }) satisfies Pick<ContactUsListParams, "status">,
    [],
  );

  const fetchFn = useCallback(
    (params: ContactUsListParams & { page: number; limit: number }, signal?: AbortSignal) => contactUsService.list(params, signal),
    [],
  );

  const list = useServerPaginatedList({
    queryKeyPrefix: "contact-us",
    exportPath: "/admin/contact-us/export",
    fetchFn,
    limit,
    filterIds: [...CONTACT_US_FILTER_IDS],
    mapFiltersToParams,
    defaultSort: "created_at:desc",
  });

  return {
    ...list,
    filterDefinitions,
    sortDefinitions,
  };
}
