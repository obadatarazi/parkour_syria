import { useCallback, useMemo } from "react";

import { rolesService } from "@/features/roles/services/roles.service";
import {
  buildPermissionNameToIdMapFromList,
  type PermissionRecord,
} from "@/features/roles/types/roles.types";
import { useCrudQuery } from "@/shared/crud";

/** Page size for each permissions request — do not raise this to "fetch all in one call". */
export const PERMISSIONS_PAGE_SIZE = 200;

export function usePermissionsList() {
  const queryFn = useCallback(
    (signal?: AbortSignal) =>
      rolesService.listAllPermissions({
        pageSize: PERMISSIONS_PAGE_SIZE,
        sort: "name",
        direction: "asc",
        signal,
      }),
    [],
  );

  const query = useCrudQuery({
    queryKey: ["permissions", "list-all"],
    queryFn,
  });

  const permissions = useMemo<PermissionRecord[]>(() => query.data?.data ?? [], [query.data?.data]);
  const total = query.data?.total ?? 0;

  const isComplete =
    query.isSuccess &&
    query.data != null &&
    permissions.length >= total &&
    !query.isError;

  const permissionNameToId = useMemo(() => {
    if (!isComplete) return new Map<string, number>();
    return buildPermissionNameToIdMapFromList(permissions);
  }, [isComplete, permissions]);

  return {
    ...query,
    permissions,
    total,
    isComplete,
    permissionNameToId,
    /** True when save must be blocked (still loading, failed, or incomplete). */
    isSaveBlocked: !isComplete,
  };
}
