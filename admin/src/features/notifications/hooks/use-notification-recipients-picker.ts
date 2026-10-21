import { useEffect, useMemo, useState } from "react";

import { usersService } from "@/features/users/services/users.service";
import type { AdminUser, UserType } from "@/features/users/types/users.types";
import { useCrudQuery, useDebouncedValue } from "@/shared/crud";

const USER_PICKER_PAGE_SIZE = 10;

type UseNotificationRecipientsPickerOptions = {
  selectedIds: number[];
  enabled?: boolean;
  isOpen?: boolean;
  type?: UserType;
};

export function getNotificationRecipientLabel(user: AdminUser): string {
  return user.fullName || user.phoneNumber || user.email || `#${user.id}`;
}

export function useNotificationRecipientsPicker({
  selectedIds,
  enabled = true,
  isOpen = false,
  type = "CUSTOMER",
}: UseNotificationRecipientsPickerOptions) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 300);

  const listQuery = useCrudQuery({
    queryKey: ["users", "notification-recipients", type, debouncedSearch, String(page)],
    queryFn: (signal) =>
      usersService.list(
        {
          page,
          limit: USER_PICKER_PAGE_SIZE,
          search: debouncedSearch.trim() || undefined,
          type,
        },
        signal,
      ),
    enabled: enabled && isOpen,
  });

  const missingSelectedIds = useMemo(() => {
    const pageIds = new Set((listQuery.data?.data ?? []).map((user) => user.id));
    return selectedIds.filter((id) => !pageIds.has(id));
  }, [listQuery.data?.data, selectedIds]);

  const selectedUsersQuery = useCrudQuery({
    queryKey: [
      "users",
      "notification-recipients",
      type,
      "selected",
      missingSelectedIds.join(","),
    ],
    queryFn: async (signal) => {
      const users = await Promise.all(
        missingSelectedIds.map((id) => usersService.getById(id, signal)),
      );
      return users;
    },
    enabled: enabled && missingSelectedIds.length > 0,
  });

  const totalPages = listQuery.data
    ? Math.max(1, Math.ceil(listQuery.data.total / listQuery.data.pageSize))
    : 1;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const selectedUsers = useMemo(() => {
    const byId = new Map<number, AdminUser>();
    for (const user of listQuery.data?.data ?? []) {
      if (selectedIds.includes(user.id)) {
        byId.set(user.id, user);
      }
    }
    for (const user of selectedUsersQuery.data ?? []) {
      byId.set(user.id, user);
    }
    return selectedIds
      .map((id) => byId.get(id))
      .filter((user): user is AdminUser => Boolean(user));
  }, [listQuery.data?.data, selectedIds, selectedUsersQuery.data]);

  return {
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    pageUsers: listQuery.data?.data ?? [],
    selectedUsers,
    isLoading: listQuery.isLoading || listQuery.isFetching,
    isError: listQuery.isError,
    error: listQuery.error,
    refetch: listQuery.refetch,
  };
}
