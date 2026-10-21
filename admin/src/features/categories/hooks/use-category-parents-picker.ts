import { useEffect, useMemo, useState } from "react";

import { categoriesService } from "@/features/categories/services/categories.service";
import type { Category } from "@/features/categories/types/categories.types";
import {
  buildForbiddenParentIds,
  flattenCategoryTreeUnique,
} from "@/features/categories/utils/category-tree.utils";
import { useCrudQuery } from "@/shared/crud";
import {
  formatBilingualLabel,
  getBilingualTitle,
} from "@/shared/lib/translation-display.utils";

const CATEGORY_PICKER_PAGE_SIZE = 10;

type UseCategoryParentsPickerOptions = {
  selectedIds: number[];
  excludeCategoryId?: number;
  enabled?: boolean;
  isOpen?: boolean;
};

export function getCategoryParentLabel(category: Category): string {
  const title = formatBilingualLabel(getBilingualTitle(category.translations, category.title));
  const parentTitle =
    category.parentCategories?.[0]?.title ?? category.parentCategory?.title ?? null;

  if (parentTitle) {
    return `${parentTitle} > ${title}`;
  }

  return title;
}

export function useCategoryParentsPicker({
  selectedIds,
  excludeCategoryId,
  enabled = true,
  isOpen = false,
}: UseCategoryParentsPickerOptions) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const listQuery = useCrudQuery({
    queryKey: [
      "categories",
      "parents-picker",
      search,
      String(page),
      String(excludeCategoryId ?? ""),
    ],
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

  /**
   * When editing, load the category with its nested children tree so we can
   * exclude the category and all descendants from parent options.
   */
  const excludeTreeQuery = useCrudQuery({
    queryKey: ["categories", "parents-picker", "forbidden-tree", String(excludeCategoryId ?? "")],
    queryFn: (signal) => categoriesService.getById(excludeCategoryId!, signal),
    enabled: enabled && excludeCategoryId != null,
  });

  // Admin list returns paginated roots with nested `children`; flatten so
  // nested categories can be selected as parents (same as product category picker).
  const pageItems = useMemo(
    () => flattenCategoryTreeUnique(listQuery.data?.data ?? []),
    [listQuery.data?.data],
  );
  const missingSelectedIds = useMemo(() => {
    const known = new Set(pageItems.map((category) => category.id));
    return selectedIds.filter((id) => !known.has(id));
  }, [pageItems, selectedIds]);

  const selectedCategoriesQuery = useCrudQuery({
    queryKey: ["categories", "parents-picker", "selected", missingSelectedIds.join(",")],
    queryFn: (signal) =>
      Promise.all(missingSelectedIds.map((id) => categoriesService.getById(id, signal))),
    enabled: enabled && missingSelectedIds.length > 0,
  });

  const forbiddenParentIds = useMemo(() => {
    if (excludeCategoryId == null) return new Set<number>();

    const tree = excludeTreeQuery.data;
    if (tree) return buildForbiddenParentIds(tree);

    // Until the tree loads (or if it fails), at least exclude self.
    return new Set<number>([excludeCategoryId]);
  }, [excludeCategoryId, excludeTreeQuery.data]);

  const pageCategories = useMemo(() => {
    if (forbiddenParentIds.size === 0) return pageItems;
    return pageItems.filter((category) => !forbiddenParentIds.has(category.id));
  }, [forbiddenParentIds, pageItems]);

  const selectedCategories = useMemo(() => {
    const byId = new Map<number, Category>();
    const fetchedSelected = flattenCategoryTreeUnique(selectedCategoriesQuery.data ?? []);
    for (const category of [...pageItems, ...fetchedSelected]) {
      byId.set(category.id, category);
    }
    return selectedIds
      .map((id) => byId.get(id))
      .filter((category): category is Category => category != null);
  }, [pageItems, selectedCategoriesQuery.data, selectedIds]);

  const totalPages = listQuery.data
    ? Math.max(1, Math.ceil(listQuery.data.total / listQuery.data.pageSize))
    : 1;

  useEffect(() => {
    setPage(1);
  }, [search]);

  return {
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    pageCategories,
    selectedCategories,
    forbiddenParentIds,
    isLoading:
      listQuery.isLoading ||
      (excludeCategoryId != null && excludeTreeQuery.isLoading && isOpen),
    isError: listQuery.isError,
    error: listQuery.error,
    refetch: listQuery.refetch,
  };
}
