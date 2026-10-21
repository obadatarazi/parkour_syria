import { useCallback, useMemo } from "react";

import { useUserTypeOptions } from "@/features/users/hooks/use-user-type-options";
import { usersService } from "@/features/users/services/users.service";
import type { UserListParams, UserType } from "@/features/users/types/users.types";
import {
  type CrudFilterDefinition,
  isActiveFilterValue,
  mapBooleanFilterValue,
  useServerPaginatedList,
} from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { useUrlSearchParam } from "@/shared/hooks/use-url-search-param";

const USER_FILTER_IDS = ["active", "type"] as const;

type UseUsersListOptions = {
  limit?: number;
  fixedType?: UserType;
};

export function useUsersList({ limit = 10, fixedType }: UseUsersListOptions = {}) {
  const t = useTranslation();
  const initialSearch = useUrlSearchParam();
  const { options: userTypeOptions } = useUserTypeOptions();

  const filterDefinitions = useMemo<CrudFilterDefinition[]>(
    () => {
      const definitions: CrudFilterDefinition[] = [
        {
          id: "active",
          label: t.status,
          allLabel: t.filterAll,
          primary: true,
          options: [
            { value: "true", label: t.active },
            { value: "false", label: t.inactive },
          ],
        },
      ];

      if (!fixedType) {
        definitions.push({
          id: "type",
          label: t.userType,
          allLabel: t.filterAll,
          options: userTypeOptions,
        });
      }

      return definitions;
    },
    [fixedType, t, userTypeOptions],
  );

  // Note: the `/admin/users` list endpoint does not currently support a
  // `sort`/`direction` param (unlike States), so no sort UI is wired here.
  const mapFiltersToParams = useCallback((values: Record<string, string>) => {
    return {
      active: mapBooleanFilterValue(values.active),
      type:
        fixedType ??
        (isActiveFilterValue(values.type) ? (values.type as UserType) : undefined),
    } satisfies Pick<UserListParams, "active" | "type">;
  }, [fixedType]);

  const fetchFn = useCallback(
    (params: UserListParams & { page: number; limit: number }, signal?: AbortSignal) => usersService.list(params, signal),
    [],
  );

  const filterIds = fixedType ? (["active"] as const) : USER_FILTER_IDS;

  const list = useServerPaginatedList({
    queryKeyPrefix: fixedType ? `users-${fixedType.toLowerCase()}` : "users",
    exportPath: "/admin/users/export",
    fetchFn,
    limit,
    filterIds: [...filterIds],
    mapFiltersToParams,
    initialSearch,
  });

  return {
    ...list,
    filterDefinitions,
  };
}
