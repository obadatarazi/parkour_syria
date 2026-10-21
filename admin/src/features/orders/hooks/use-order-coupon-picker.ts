import { useEffect, useState } from "react";

import { couponsService } from "@/features/coupons/services/coupons.service";
import { useCrudQuery, useDebouncedValue } from "@/shared/crud";

const COUPON_PICKER_PAGE_SIZE = 10;

type UseOrderCouponPickerOptions = {
  enabled?: boolean;
  isOpen?: boolean;
};

export function normalizeCouponCode(value: string): string {
  return value.trim().toUpperCase();
}

export function useOrderCouponPicker({
  enabled = true,
  isOpen = false,
}: UseOrderCouponPickerOptions) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 300);

  const listQuery = useCrudQuery({
    queryKey: ["coupons", "order-picker", debouncedSearch, String(page)],
    queryFn: (signal) =>
      couponsService.list(
        {
          page,
          limit: COUPON_PICKER_PAGE_SIZE,
          search: debouncedSearch.trim() || undefined,
          status: "ACTIVE",
          sort: "created_at",
          direction: "desc",
        },
        signal,
      ),
    enabled: enabled && isOpen,
  });

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  return {
    search,
    setSearch,
    page,
    setPage,
    totalPages: Math.max(1, Math.ceil((listQuery.data?.total ?? 0) / COUPON_PICKER_PAGE_SIZE)),
    pageCoupons: listQuery.data?.data ?? [],
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    error: listQuery.error,
    refetch: listQuery.refetch,
  };
}
