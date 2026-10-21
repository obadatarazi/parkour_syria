import { useCallback, useMemo } from "react";

import { categoriesService } from "@/features/categories/services/categories.service";
import type { CategoryListParams } from "@/features/categories/types/categories.types";
import {
  type CrudFilterDefinition,
  type CrudSortDefinition,
  isActiveFilterValue,
  mapBooleanFilterValue,
  useServerPaginatedList,
} from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

export const CATEGORY_SCOPE_ROOT = "root";

const CATEGORY_SCOPE_DEPTH_VALUES = ["1", "2", "3", "4", "5"] as const;

const CATEGORY_FILTER_IDS = ["publish", "showMenu", "showInHomePage", "feature", "categoryScope"] as const;

function parseCategoryScopeDepth(categoryScope: string | undefined): number | undefined {
  if (!categoryScope || !CATEGORY_SCOPE_DEPTH_VALUES.includes(categoryScope as (typeof CATEGORY_SCOPE_DEPTH_VALUES)[number])) {
    return undefined;
  }

  return Number(categoryScope);
}

export function useCategoriesList(limit = 12) {
  const t = useTranslation();

  const filterDefinitions = useMemo<CrudFilterDefinition[]>(
    () => [
      {
        id: "categoryScope",
        label: t.filterCategoryScope,
        allLabel: t.filterAll,
        primary: true,
        options: [
          { value: CATEGORY_SCOPE_ROOT, label: t.filterRootCategories },
          ...CATEGORY_SCOPE_DEPTH_VALUES.map((depth) => ({
            value: depth,
            label:
              depth === "1"
                ? t.filterDepth1
                : depth === "2"
                  ? t.filterDepth2
                  : depth === "3"
                    ? t.filterDepth3
                    : depth === "4"
                      ? t.filterDepth4
                      : t.filterDepth5,
          })),
        ],
      },
      {
        id: "publish",
        label: t.status,
        allLabel: t.filterAll,
        options: [
          { value: "true", label: t.active },
          { value: "false", label: t.inactive },
        ],
      },
      {
        id: "showMenu",
        label: t.showMenu,
        allLabel: t.filterAll,
        options: [
          { value: "true", label: t.active },
          { value: "false", label: t.inactive },
        ],
      },
      {
        id: "showInHomePage",
        label: t.showInHomePage,
        allLabel: t.filterAll,
        options: [
          { value: "true", label: t.active },
          { value: "false", label: t.inactive },
        ],
      },
      {
        id: "feature",
        label: t.featured,
        allLabel: t.filterAll,
        options: [
          { value: "true", label: t.active },
          { value: "false", label: t.inactive },
        ],
      },
    ],
    [t],
  );

  const sortDefinitions = useMemo<CrudSortDefinition[]>(
    () => [
      {
        id: "sort",
        label: t.sortBy,
        options: [
          { value: "created_at:desc", label: t.sortNewest },
          { value: "created_at:asc", label: t.sortOldest },
          { value: "title:asc", label: t.sortTitleAsc },
          { value: "title:desc", label: t.sortTitleDesc },
          { value: "depth:asc", label: t.sortDepthAsc },
          { value: "id:desc", label: t.sortIdDesc },
        ],
      },
    ],
    [t],
  );

  const mapFiltersToParams = useCallback((values: Record<string, string>) => {
    const categoryScope = values.categoryScope;

    if (categoryScope === CATEGORY_SCOPE_ROOT) {
      return {
        publish: mapBooleanFilterValue(values.publish),
        showMenu: mapBooleanFilterValue(values.showMenu),
        showInHomePage: mapBooleanFilterValue(values.showInHomePage),
        feature: mapBooleanFilterValue(values.feature),
        rootOnly: true,
      } satisfies Pick<
        CategoryListParams,
        "publish" | "showMenu" | "showInHomePage" | "feature" | "rootOnly" | "depth"
      >;
    }

    const scopeDepth = parseCategoryScopeDepth(
      isActiveFilterValue(categoryScope) ? categoryScope : undefined,
    );

    return {
      publish: mapBooleanFilterValue(values.publish),
      showMenu: mapBooleanFilterValue(values.showMenu),
      showInHomePage: mapBooleanFilterValue(values.showInHomePage),
      feature: mapBooleanFilterValue(values.feature),
      depth: scopeDepth,
    } satisfies Pick<
      CategoryListParams,
      "publish" | "showMenu" | "showInHomePage" | "feature" | "rootOnly" | "depth"
    >;
  }, []);

  const fetchFn = useCallback(
    (params: CategoryListParams & { page: number; limit: number }, signal?: AbortSignal) => categoriesService.list(params, signal),
    [],
  );

  const list = useServerPaginatedList({
    queryKeyPrefix: "categories",
    exportPath: "/admin/categories/export",
    fetchFn,
    limit,
    filterIds: [...CATEGORY_FILTER_IDS],
    mapFiltersToParams,
    defaultSort: "created_at:desc",
  });

  const categoryScope = list.filters.values.categoryScope;
  const isRootScope = categoryScope === CATEGORY_SCOPE_ROOT;
  const scopeDepth = parseCategoryScopeDepth(
    isActiveFilterValue(categoryScope) ? categoryScope : undefined,
  );

  return {
    ...list,
    filterDefinitions,
    sortDefinitions,
    isRootScope,
    scopeDepth,
  };
}
