import { useMemo } from "react";

import { categoriesService } from "@/features/categories/services/categories.service";
import type { Category } from "@/features/categories/types/categories.types";
import {
  buildCategoryParentMap,
  buildCategorySummaryMap,
  formatCategoryBreadcrumb,
  formatCategoryBreadcrumbPaths,
} from "@/features/categories/utils/category-path.utils";
import { flattenCategoryTree } from "@/features/categories/utils/category-tree.utils";
import { useCrudQuery } from "@/shared/crud";

const CATEGORY_PATH_INDEX_PAGE_SIZE = 100;

async function fetchAllCategoryRoots(): Promise<Category[]> {
  const roots: Category[] = [];
  let page = 1;
  let total = 0;

  do {
    const result = await categoriesService.list({
      page,
      limit: CATEGORY_PATH_INDEX_PAGE_SIZE,
      sort: "depth",
      direction: "asc",
    });

    roots.push(...result.data);
    total = result.total;
    page += 1;
  } while (roots.length < total);

  return roots;
}

export function useCategoryPathIndex(enabled = true) {
  const query = useCrudQuery({
    queryKey: ["categories", "path-index"],
    queryFn: fetchAllCategoryRoots,
    enabled,
  });

  const allCategoryRoots = useMemo(() => query.data ?? [], [query.data]);

  const allCategoriesFlat = useMemo(
    () => flattenCategoryTree(allCategoryRoots),
    [allCategoryRoots],
  );

  const parentMap = useMemo(
    () => buildCategoryParentMap(allCategoriesFlat),
    [allCategoriesFlat],
  );

  const categoryById = useMemo(
    () => buildCategorySummaryMap(allCategoriesFlat),
    [allCategoriesFlat],
  );

  const getBreadcrumb = useMemo(
    () => (category: Category) => formatCategoryBreadcrumb(category, parentMap, categoryById),
    [categoryById, parentMap],
  );

  const getBreadcrumbPaths = useMemo(
    () => (category: Category) => formatCategoryBreadcrumbPaths(category, parentMap, categoryById),
    [categoryById, parentMap],
  );

  return {
    ...query,
    allCategoryRoots,
    allCategoriesFlat,
    parentMap,
    categoryById,
    getBreadcrumb,
    getBreadcrumbPaths,
  };
}
