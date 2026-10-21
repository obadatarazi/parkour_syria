import { useEffect, useMemo, useState } from "react";

import { productsService } from "@/features/products/services/products.service";
import type { Product, ProductListParams } from "@/features/products/types/products.types";
import { useCrudQuery, useDebouncedValue } from "@/shared/crud";
import {
  formatBilingualLabel,
  getBilingualTitle,
} from "@/shared/lib/translation-display.utils";

const PRODUCT_PICKER_PAGE_SIZE = 10;

type UseOrderProductPickerOptions = {
  selectedId: number | null;
  enabled?: boolean;
  /** When true, list query runs (focus / open dropdown). */
  active?: boolean;
  listParams?: Pick<ProductListParams, "type" | "publish" | "approveAddToCarePlan">;
  brandId?: number | null;
  categoryId?: number | null;
};

export function getOrderProductLabel(product: Product): string {
  return formatBilingualLabel(getBilingualTitle(product.translations, product.title));
}

export function useOrderProductPicker({
  selectedId,
  enabled = true,
  active = false,
  listParams,
  brandId = null,
  categoryId = null,
}: UseOrderProductPickerOptions) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 300);
  const type = listParams ? listParams.type : "SIMPLE";
  const publish = listParams?.publish ?? true;
  const approveAddToCarePlan = listParams?.approveAddToCarePlan;

  const listQuery = useCrudQuery({
    queryKey: [
      "products",
      "order-picker",
      type ?? "all",
      String(publish),
      String(approveAddToCarePlan ?? "any"),
      debouncedSearch,
      String(page),
      String(brandId ?? ""),
      String(categoryId ?? ""),
    ],
    queryFn: (signal) =>
      productsService.list(
        {
          page,
          limit: PRODUCT_PICKER_PAGE_SIZE,
          search: debouncedSearch.trim() || undefined,
          type,
          publish,
          approveAddToCarePlan,
          brandId: brandId ?? undefined,
          categoryId: categoryId ?? undefined,
        },
        signal,
      ),
    enabled: enabled && active,
  });

  const selectedOnPage = useMemo(() => {
    if (selectedId == null) return null;
    return (listQuery.data?.data ?? []).find((product) => product.id === selectedId) ?? null;
  }, [listQuery.data?.data, selectedId]);

  const selectedProductQuery = useCrudQuery({
    queryKey: ["products", "order-picker", "selected", String(selectedId ?? "")],
    queryFn: async (signal) => {
      if (selectedId == null) return null;
      return productsService.getById(selectedId, signal);
    },
    enabled: enabled && selectedId != null && selectedOnPage == null,
  });

  const totalPages = listQuery.data
    ? Math.max(1, Math.ceil(listQuery.data.total / listQuery.data.pageSize))
    : 1;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, brandId, categoryId]);

  const selectedProduct = useMemo(() => {
    if (selectedId == null) return null;
    if (selectedOnPage) return selectedOnPage;
    if (selectedProductQuery.data?.id === selectedId) return selectedProductQuery.data;
    return null;
  }, [selectedId, selectedOnPage, selectedProductQuery.data]);

  return {
    search,
    setSearch,
    debouncedSearch,
    page,
    setPage,
    totalPages,
    pageProducts: listQuery.data?.data ?? [],
    selectedProduct,
    isLoading: listQuery.isLoading || listQuery.isFetching,
    isError: listQuery.isError,
    error: listQuery.error,
    refetch: listQuery.refetch,
  };
}
