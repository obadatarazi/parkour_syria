import { useCallback, useMemo } from "react";

import { meNotificationsService } from "@/features/notifications/services/me-notifications.service";
import type {
  NotificationListParams,
  NotificationTypeValue,
} from "@/features/notifications/types/notifications.types";
import {
  type CrudFilterDefinition,
  type CrudSortDefinition,
  mapBooleanFilterValue,
  useServerPaginatedList,
} from "@/shared/crud";
import { CRUD_FILTER_ALL_VALUE } from "@/shared/crud/constants/crud.constants";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { useNotificationTypeOptions } from "@/shared/hooks/use-options";

const NOTIFICATION_FILTER_IDS = ["type", "read"] as const;

export function useNotificationsList(limit = 10) {
  const t = useTranslation();
  const { options: typeOptions } = useNotificationTypeOptions();

  const filterDefinitions = useMemo<CrudFilterDefinition[]>(
    () => [
      {
        id: "type",
        label: t.notificationType,
        allLabel: t.filterAll,
        primary: true,
        options: typeOptions,
      },
      {
        id: "read",
        label: t.readStatus,
        allLabel: t.filterAll,
        primary: true,
        options: [
          { value: "false", label: t.unread },
          { value: "true", label: t.read },
        ],
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
          { value: "id:desc", label: t.sortIdDesc },
        ],
      },
    ],
    [t],
  );

  const mapFiltersToParams = useCallback((values: Record<string, string>) => {
    const type = values.type;
    return {
      type:
        type && type !== CRUD_FILTER_ALL_VALUE
          ? (type as NotificationTypeValue)
          : undefined,
      read: mapBooleanFilterValue(values.read),
    } satisfies Pick<NotificationListParams, "type" | "read">;
  }, []);

  const fetchFn = useCallback(
    (
      params: NotificationListParams & { page: number; limit: number },
      signal?: AbortSignal,
    ) => meNotificationsService.list(params, signal),
    [],
  );

  const list = useServerPaginatedList({
    queryKeyPrefix: "me-notifications",
    fetchFn,
    limit,
    filterIds: [...NOTIFICATION_FILTER_IDS],
    mapFiltersToParams,
    defaultSort: "created_at:desc",
  });

  return {
    ...list,
    filterDefinitions,
    sortDefinitions,
  };
}
