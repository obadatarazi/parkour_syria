import { useCallback, useMemo } from "react";

import { useBlogCategoryOptions } from "@/features/blog-categories/hooks/use-blog-categories-list";
import { blogPostsService } from "@/features/blog-posts/services/blog-posts.service";
import type { BlogPostListParams } from "@/features/blog-posts/types/blog-posts.types";
import {
  type CrudFilterDefinition,
  type CrudSortDefinition,
  mapBooleanFilterValue,
  mapStringFilterValue,
  useServerPaginatedList,
} from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

const BLOG_POST_FILTER_IDS = ["publish", "blogCategoryId"] as const;

export function useBlogPostsList(limit = 20) {
  const t = useTranslation();
  const { options: categoryOptions } = useBlogCategoryOptions();

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
      {
        id: "blogCategoryId",
        label: t.fieldCategory,
        allLabel: t.allCategories,
        primary: true,
        options: categoryOptions,
      },
    ],
    [categoryOptions, t],
  );

  const sortDefinitions = useMemo<CrudSortDefinition[]>(
    () => [
      {
        id: "sort",
        label: t.sortBy,
        options: [
          { value: "published_at:desc", label: `${t.fieldPublishedAt} ↓` },
          { value: "created_at:desc", label: t.sortNewest },
          { value: "created_at:asc", label: t.sortOldest },
        ],
      },
    ],
    [t],
  );

  const mapFiltersToParams = useCallback(
    (values: Record<string, string>) =>
      ({
        publish: mapBooleanFilterValue(values.publish),
        blogCategoryId: mapStringFilterValue(values.blogCategoryId),
      }) satisfies Pick<BlogPostListParams, "publish" | "blogCategoryId">,
    [],
  );

  const fetchFn = useCallback(
    (params: BlogPostListParams & { page: number; limit: number }, signal?: AbortSignal) =>
      blogPostsService.list(params, signal),
    [],
  );

  const list = useServerPaginatedList({
    queryKeyPrefix: "blog-posts",
    exportPath: "/admin/blog-posts/export",
    fetchFn,
    limit,
    filterIds: [...BLOG_POST_FILTER_IDS],
    mapFiltersToParams,
    defaultSort: "created_at:desc",
  });

  return { ...list, filterDefinitions, sortDefinitions };
}
