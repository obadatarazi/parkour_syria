import { useCallback, useMemo } from "react";

import { visualSettingsService } from "@/features/visual-settings/services/visual-settings.service";
import type { VisualSettingListParams } from "@/features/visual-settings/types/visual-settings.types";
import { type CrudSortDefinition, useServerPaginatedList } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

export function useVisualSettingsList(limit = 20) {
  const t = useTranslation();

  const sortDefinitions = useMemo<CrudSortDefinition[]>(
    () => [
      {
        id: "sort",
        label: t.sortBy,
        options: [
          { value: "setting_key:asc", label: t.sortSettingKeyAsc },
          { value: "setting_key:desc", label: t.sortSettingKeyDesc },
          { value: "created_at:desc", label: t.sortNewest },
          { value: "created_at:asc", label: t.sortOldest },
          { value: "id:desc", label: t.sortIdDesc },
        ],
      },
    ],
    [t],
  );

  const fetchFn = useCallback(
    (params: VisualSettingListParams & { page: number; limit: number }, signal?: AbortSignal) =>
      visualSettingsService.list(params, signal),
    [],
  );

  const list = useServerPaginatedList({
    queryKeyPrefix: "visual-settings",
    fetchFn,
    limit,
    defaultSort: "setting_key:asc",
  });

  return {
    ...list,
    sortDefinitions,
  };
}
