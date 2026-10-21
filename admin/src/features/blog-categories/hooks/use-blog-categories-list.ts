import { useCallback, useMemo } from "react";

import { blogCategoriesService } from "@/features/blog-categories/services/blog-categories.service";
import type { BlogCategory, BlogCategoryListParams } from "@/features/blog-categories/types/blog-categories.types";
import {
  type CrudFilterDefinition,
  type CrudSortDefinition,
  mapBooleanFilterValue,
  useCrudQuery,
  useServerPaginatedList,
} from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { pickLocaleText } from "@/shared/lib/api/locale-fields.utils";

const BLOG_CATEGORY_FILTER_IDS = ["publish"] as const;

export function useBlogCategoriesList(limit = 20) {
  const t = useTranslation();

  const filterDefinitions = useMemo<CrudFilterDefinition[]>(
    () => [
      {
        id: "publish",
        label: t.status,
        allLabel: t.filterAll,
        primary: true,
        options: [
          { value: "true", label: t.publishedLabel },
          { value: "false", label: t.draftLabel },
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
          { value: "sort_order:asc", label: t.sortOrder },
          { value: "created_at:desc", label: t.sortNewest },
          { value: "created_at:asc", label: t.sortOldest },
        ],
      },
    ],
    [t],
  );

  const mapFiltersToParams = useCallback(
    (values: Record<string, string>) =>
      ({ publish: mapBooleanFilterValue(values.publish) }) satisfies Pick<BlogCategoryListParams, "publish">,
    [],
  );

  const fetchFn = useCallback(
    (params: BlogCategoryListParams & { page: number; limit: number }, signal?: AbortSignal) =>
      blogCategoriesService.list(params, signal),
    [],
  );

  const list = useServerPaginatedList({
    queryKeyPrefix: "blog-categories",
    exportPath: "/admin/blog-categories/export",
    fetchFn,
    limit,
    filterIds: [...BLOG_CATEGORY_FILTER_IDS],
    mapFiltersToParams,
    defaultSort: "sort_order:asc",
  });

  return { ...list, filterDefinitions, sortDefinitions };
}

/** Category picker options for the blog post form and filter. */
export function useBlogCategoryOptions() {
  const queryFn = useCallback(
    (signal?: AbortSignal) => blogCategoriesService.list({ limit: 200, sort: "sort_order", direction: "asc" }, signal),
    [],
  );

  const query = useCrudQuery({
    queryKey: ["blog-categories", "options"],
    queryFn,
    staleTime: 10 * 60 * 1000,
  });

  const options = useMemo(
    () =>
      (query.data?.data ?? []).map((blogCategory: BlogCategory) => ({
        value: String(blogCategory.id),
        label: pickLocaleText(blogCategory.translations, "title", blogCategory.title),
      })),
    [query.data?.data],
  );

  return { options, isLoading: query.isLoading };
}
