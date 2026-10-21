import { useEffect, useMemo, useState } from "react";

import { rolesService } from "@/features/roles/services/roles.service";
import type { Role } from "@/features/roles/types/roles.types";
import { useCrudQuery } from "@/shared/crud";

const ROLE_PICKER_PAGE_SIZE = 10;

type UseRolePickerOptions = {
  selectedIds: number[];
  enabled?: boolean;
};

export function useRolePicker({ selectedIds, enabled = true }: UseRolePickerOptions) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const listQuery = useCrudQuery({
    queryKey: ["roles", "picker", search, String(page)],
    queryFn: (signal) =>
      rolesService.list(
        {
          page,
          limit: ROLE_PICKER_PAGE_SIZE,
          search: search.trim() || undefined,
        },
        signal,
      ),
    enabled,
  });

  const pageRoles = listQuery.data?.data ?? [];
  const totalPages = listQuery.data
    ? Math.max(1, Math.ceil(listQuery.data.total / listQuery.data.pageSize))
    : 1;

  const missingSelectedIds = useMemo(() => {
    const knownIds = new Set(pageRoles.map((role) => role.id));
    return selectedIds.filter((id) => !knownIds.has(id));
  }, [pageRoles, selectedIds]);

  const missingRolesQuery = useCrudQuery({
    queryKey: ["roles", "picker", "selected", missingSelectedIds.join(",")],
    queryFn: (signal) =>
      Promise.all(missingSelectedIds.map((id) => rolesService.getById(id, signal))),
    enabled: enabled && missingSelectedIds.length > 0,
  });

  useEffect(() => {
    setPage(1);
  }, [search]);

  const displayRoles = useMemo(() => {
    const roleMap = new Map<number, Role>();
    for (const role of [...(missingRolesQuery.data ?? []), ...pageRoles]) {
      roleMap.set(role.id, role);
    }
    return Array.from(roleMap.values());
  }, [missingRolesQuery.data, pageRoles]);

  const selectedRoles = useMemo(
    () =>
      selectedIds
        .map((id) => displayRoles.find((role) => role.id === id))
        .filter((role): role is Role => role != null),
    [displayRoles, selectedIds],
  );

  return {
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    pageRoles,
    selectedRoles,
    displayRoles,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    error: listQuery.error,
    refetch: listQuery.refetch,
  };
}
