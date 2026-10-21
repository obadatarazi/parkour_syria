import { useEffect, useMemo, useState } from "react";

import { categoriesService } from "@/features/categories/services/categories.service";
import type { Category } from "@/features/categories/types/categories.types";
import { flattenCategoryTreeUnique } from "@/features/categories/utils/category-tree.utils";
import { useCrudQuery } from "@/shared/crud";
import {
  formatBilingualLabel,
  getBilingualTitle,
} from "@/shared/lib/translation-display.utils";

const CATEGORY_PICKER_PAGE_SIZE = 10;

type UseCategoryPickerOptions = {
  selectedId: number | null;
  excludeCategoryId?: number;
  enabled?: boolean;
  isOpen?: boolean;
};

export function getCategoryLabel(category: Category): string {
  return formatBilingualLabel(getBilingualTitle(category.translations, category.title));
}

export function useCategoryPicker({
  selectedId,
  excludeCategoryId,
  enabled = true,
  isOpen = false,
}: UseCategoryPickerOptions) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const listQuery = useCrudQuery({
    queryKey: ["categories", "picker", search, String(page), String(excludeCategoryId ?? "")],
    queryFn: (signal) =>
      categoriesService.list(
        {
          page,
          limit: CATEGORY_PICKER_PAGE_SIZE,
          search: search.trim() || undefined,
          sort: "depth",
          direction: "asc",
        },
        signal,
      ),
    enabled: enabled && isOpen,
  });

  // Admin list returns paginated roots with nested `children`; flatten so
  // nested categories are selectable (same as parents / product pickers).
  const pageCategories = useMemo(() => {
    const items = flattenCategoryTreeUnique(listQuery.data?.data ?? []);
    if (excludeCategoryId == null) return items;
    return items.filter((category) => category.id !== excludeCategoryId);
  }, [excludeCategoryId, listQuery.data?.data]);

  const selectedOnPage = useMemo(() => {
    if (selectedId == null) return null;
    return pageCategories.find((category) => category.id === selectedId) ?? null;
  }, [pageCategories, selectedId]);

  const selectedCategoryQuery = useCrudQuery({
    queryKey: ["categories", "picker", "selected", String(selectedId ?? "")],
    queryFn: async (signal) => {
      if (selectedId == null) return null;
      return categoriesService.getById(selectedId, signal);
    },
    enabled: enabled && selectedId != null && selectedOnPage == null,
  });

  const totalPages = listQuery.data
    ? Math.max(1, Math.ceil(listQuery.data.total / listQuery.data.pageSize))
    : 1;

  useEffect(() => {
    setPage(1);
  }, [search]);

  const selectedCategory = useMemo(() => {
    if (selectedId == null) return null;
    if (selectedOnPage) return selectedOnPage;
    if (selectedCategoryQuery.data?.id === selectedId) return selectedCategoryQuery.data;
    return null;
  }, [selectedCategoryQuery.data, selectedId, selectedOnPage]);

  return {
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    pageCategories,
    selectedCategory,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    error: listQuery.error,
    refetch: listQuery.refetch,
  };
}
