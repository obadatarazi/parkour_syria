import { useEffect, useMemo, useState } from "react";

import { productsService } from "@/features/products/services/products.service";
import type { Product } from "@/features/products/types/products.types";
import { useCrudQuery } from "@/shared/crud";
import {
  formatBilingualLabel,
  getBilingualTitle,
} from "@/shared/lib/translation-display.utils";

const PRODUCT_PICKER_PAGE_SIZE = 10;

type UseProductPickerOptions = {
  selectedId: number | null;
  enabled?: boolean;
  isOpen?: boolean;
  brandId?: number | null;
  categoryId?: number | null;
};

export function getProductLabel(product: Product): string {
  return formatBilingualLabel(getBilingualTitle(product.translations, product.title));
}

export function useProductPicker({
  selectedId,
  enabled = true,
  isOpen = false,
  brandId = null,
  categoryId = null,
}: UseProductPickerOptions) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const listQuery = useCrudQuery({
    queryKey: [
      "products",
      "picker",
      search,
      String(page),
      String(brandId ?? ""),
      String(categoryId ?? ""),
    ],
    queryFn: (signal) =>
      productsService.list(
        {
          page,
          limit: PRODUCT_PICKER_PAGE_SIZE,
          search: search.trim() || undefined,
          brandId: brandId ?? undefined,
          categoryId: categoryId ?? undefined,
          sort: "created_at",
          direction: "desc",
        },
        signal,
      ),
    enabled: enabled && isOpen,
  });

  const pageProducts = listQuery.data?.data ?? [];
  const selectedOnPage = useMemo(() => {
    if (selectedId == null) return null;
    return pageProducts.find((product) => product.id === selectedId) ?? null;
  }, [pageProducts, selectedId]);

  const selectedProductQuery = useCrudQuery({
    queryKey: ["products", "picker", "selected", String(selectedId ?? "")],
    queryFn: async (signal) => {
      if (selectedId == null) return null;
      return productsService.getById(selectedId, signal);
    },
    enabled: enabled && selectedId != null && selectedOnPage == null,
  });

  useEffect(() => {
    setPage(1);
  }, [search, brandId, categoryId]);

  const totalPages = useMemo(() => {
    const total = listQuery.data?.total ?? 0;
    const pageSize = listQuery.data?.pageSize ?? PRODUCT_PICKER_PAGE_SIZE;
    return Math.max(1, Math.ceil(total / pageSize));
  }, [listQuery.data]);

  const selectedProduct = useMemo(() => {
    if (selectedId == null) return null;
    if (selectedOnPage) return selectedOnPage;
    if (selectedProductQuery.data?.id === selectedId) return selectedProductQuery.data;
    return null;
  }, [selectedId, selectedOnPage, selectedProductQuery.data]);

  return {
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    pageProducts,
    selectedProduct,
    isLoading: listQuery.isLoading,
    isSelectedLoading: selectedProductQuery.isLoading,
    isError: listQuery.isError,
    error: listQuery.error,
    refetch: listQuery.refetch,
  };
}
