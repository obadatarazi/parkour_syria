import { useCallback, useEffect, useRef, useState } from "react";

import { categoriesService } from "@/features/categories/services/categories.service";
import type { Category } from "@/features/categories/types/categories.types";
import {
  categoryCanExpand,
  categoryHasLoadedChildren,
  collectParentCategoryIds,
  getCategoryChildren,
  patchCategoryInLoadedMap,
} from "@/features/categories/utils/category-tree.utils";
import { notify } from "@/shared/lib/notifications";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type UseCategoryTreeExpansionOptions = {
  /** When true, expand every parent that already has embedded children (e.g. search results). */
  autoExpandEmbedded?: boolean;
  categories?: Category[];
};

export function useCategoryTreeExpansion(
  resetKey: string,
  { autoExpandEmbedded = false, categories = [] }: UseCategoryTreeExpansionOptions = {},
) {
  const t = useTranslation();
  const [expandedIds, setExpandedIds] = useState<Set<number>>(() => new Set());
  const [loadedCategories, setLoadedCategories] = useState<Record<number, Category>>({});
  const [loadingIds, setLoadingIds] = useState<Set<number>>(() => new Set());
  const autoExpandedForKeyRef = useRef<string | null>(null);

  useEffect(() => {
    setExpandedIds(new Set());
    setLoadedCategories({});
    setLoadingIds(new Set());
    autoExpandedForKeyRef.current = null;
  }, [resetKey]);

  // After a search (or other reset), open ancestor rows so nested matches are visible.
  useEffect(() => {
    if (!autoExpandEmbedded || categories.length === 0) return;

    const parentIds = collectParentCategoryIds(categories);
    if (parentIds.length === 0) return;

    // Include parent ids so a stale list for a new search key does not block the real result set.
    const signature = `${resetKey}:${[...parentIds].sort((a, b) => a - b).join(",")}`;
    if (autoExpandedForKeyRef.current === signature) return;

    autoExpandedForKeyRef.current = signature;
    setExpandedIds(new Set(parentIds));
  }, [autoExpandEmbedded, categories, resetKey]);

  const resolveCategory = useCallback(
    (category: Category) => loadedCategories[category.id] ?? category,
    [loadedCategories],
  );

  const resolveChildren = useCallback(
    (category: Category) => getCategoryChildren(resolveCategory(category)),
    [resolveCategory],
  );

  const toggleExpanded = useCallback(
    async (category: Category) => {
      if (expandedIds.has(category.id)) {
        setExpandedIds((previous) => {
          const next = new Set(previous);
          next.delete(category.id);
          return next;
        });
        return;
      }

      const resolved = resolveCategory(category);

      if (!categoryCanExpand(resolved)) {
        return;
      }

      if (categoryHasLoadedChildren(resolved)) {
        setExpandedIds((previous) => new Set(previous).add(category.id));
        return;
      }

      // Lazy-load children when the backend says they exist but are not embedded.
      setLoadingIds((previous) => new Set(previous).add(category.id));

      try {
        const fullCategory = await categoriesService.getById(category.id);
        setLoadedCategories((previous) => ({ ...previous, [category.id]: fullCategory }));

        // Expand only after children are available — avoids empty expanded shells on failure/edge cases.
        if (categoryHasLoadedChildren(fullCategory)) {
          setExpandedIds((previous) => new Set(previous).add(category.id));
        }
      } catch (caughtError) {
        const error =
          caughtError instanceof Error ? caughtError : new Error("Failed to load category children");
        notify.error(t.errorMessage, resolveServiceErrorMessage(error, t));
        // Do not mark expanded on failure — keeps tree state consistent.
      } finally {
        setLoadingIds((previous) => {
          const next = new Set(previous);
          next.delete(category.id);
          return next;
        });
      }
    },
    [expandedIds, resolveCategory, t],
  );

  const expandAll = useCallback(
    (roots: Category[]) => {
      // Only expand nodes that already have embedded children (no mass lazy fetch).
      setExpandedIds(new Set(collectParentCategoryIds(roots)));
    },
    [],
  );

  const collapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  /**
   * Drop a deleted category (and cached descendants) from expansion/loaded
   * state so parents do not keep showing stale children after refetch.
   */
  const pruneDeletedCategory = useCallback((categoryId: number) => {
    setLoadedCategories((previous) => {
      const toRemove = new Set<number>([categoryId]);

      const collectDescendants = (id: number) => {
        const category = previous[id];
        for (const child of category?.children ?? []) {
          if (toRemove.has(child.id)) continue;
          toRemove.add(child.id);
          collectDescendants(child.id);
        }
      };
      collectDescendants(categoryId);

      const next: Record<number, Category> = {};
      for (const [key, category] of Object.entries(previous)) {
        const id = Number(key);
        if (toRemove.has(id)) continue;

        const children = (category.children ?? []).filter((child) => !toRemove.has(child.id));
        const pruned =
          children.length === (category.children ?? []).length
            ? category
            : {
                ...category,
                children,
                hasChildren: children.length > 0,
                childrenCount: children.length,
              };
        next[id] = pruned;
      }
      return next;
    });

    setExpandedIds((previous) => {
      if (!previous.has(categoryId) && previous.size === 0) return previous;
      const next = new Set(previous);
      next.delete(categoryId);
      return next;
    });

    setLoadingIds((previous) => {
      if (!previous.has(categoryId)) return previous;
      const next = new Set(previous);
      next.delete(categoryId);
      return next;
    });
  }, []);

  const patchCategory = useCallback(
    (categoryId: number, patch: Partial<Category>, source?: Category) => {
      setLoadedCategories((previous) =>
        patchCategoryInLoadedMap(previous, categoryId, patch, source),
      );
    },
    [],
  );

  const isExpanded = useCallback((categoryId: number) => expandedIds.has(categoryId), [expandedIds]);

  const isLoadingChildren = useCallback(
    (categoryId: number) => loadingIds.has(categoryId),
    [loadingIds],
  );

  return {
    expandedIds,
    resolveCategory,
    resolveChildren,
    toggleExpanded,
    expandAll,
    collapseAll,
    pruneDeletedCategory,
    patchCategory,
    isExpanded,
    isLoadingChildren,
  };
}
