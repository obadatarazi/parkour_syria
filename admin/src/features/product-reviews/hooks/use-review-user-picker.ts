import { useEffect, useMemo, useState } from "react";

import { usersService } from "@/features/users/services/users.service";
import type { AdminUser } from "@/features/users/types/users.types";
import { useCrudQuery, useDebouncedValue } from "@/shared/crud";

const USER_PICKER_PAGE_SIZE = 10;

type UseReviewUserPickerOptions = {
  selectedId: number | null;
  enabled?: boolean;
  /** When true, list query runs (focus / open dropdown). */
  isOpen?: boolean;
};

export function getReviewUserLabel(user: AdminUser): string {
  return user.fullName || user.phoneNumber || user.email || `#${user.id}`;
}

export function useReviewUserPicker({
  selectedId,
  enabled = true,
  isOpen = false,
}: UseReviewUserPickerOptions) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 300);

  const listQuery = useCrudQuery({
    queryKey: ["users", "review-picker", debouncedSearch, String(page)],
    queryFn: (signal) =>
      usersService.list(
        {
          page,
          limit: USER_PICKER_PAGE_SIZE,
          search: debouncedSearch.trim() || undefined,
          type: "CUSTOMER",
        },
        signal,
      ),
    enabled: enabled && isOpen,
  });

  const selectedOnPage = useMemo(() => {
    if (selectedId == null) return null;
    return (listQuery.data?.data ?? []).find((user) => user.id === selectedId) ?? null;
  }, [listQuery.data?.data, selectedId]);

  const selectedUserQuery = useCrudQuery({
    queryKey: ["users", "review-picker", "selected", String(selectedId ?? "")],
    queryFn: async (signal) => {
      if (selectedId == null) return null;
      return usersService.getById(selectedId, signal);
    },
    enabled: enabled && selectedId != null && selectedOnPage == null,
  });

  const totalPages = listQuery.data
    ? Math.max(1, Math.ceil(listQuery.data.total / listQuery.data.pageSize))
    : 1;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const selectedUser = useMemo(() => {
    if (selectedId == null) return null;
    if (selectedOnPage) return selectedOnPage;
    if (selectedUserQuery.data?.id === selectedId) return selectedUserQuery.data;
    return null;
  }, [selectedId, selectedOnPage, selectedUserQuery.data]);

  return {
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    pageUsers: listQuery.data?.data ?? [],
    selectedUser,
    isLoading: listQuery.isLoading || listQuery.isFetching,
    isError: listQuery.isError,
    error: listQuery.error,
    refetch: listQuery.refetch,
  };
}
