import type { Category, CategorySummary } from "@/features/categories/types/categories.types";

const PATH_SEPARATOR = " > ";

export function getCategoryParentIds(category: Category): number[] {
  if (category.parentCategories?.length) {
    return category.parentCategories.map((parent) => parent.id);
  }

  if (category.parentCategory) {
    return [category.parentCategory.id];
  }

  return [];
}

export function buildCategoryParentMap(categories: Category[]): Map<number, number[]> {
  const parentMap = new Map<number, number[]>();

  for (const category of categories) {
    parentMap.set(category.id, getCategoryParentIds(category));
  }

  return parentMap;
}

export function buildCategorySummaryMap(categories: Category[]): Map<number, CategorySummary> {
  const summaryMap = new Map<number, CategorySummary>();

  const registerSummary = (summary: CategorySummary) => {
    summaryMap.set(summary.id, summary);
  };

  for (const category of categories) {
    registerSummary({
      id: category.id,
      title: category.title,
      slug: category.slug,
      featureImageFileUrl: category.featureImageFileUrl,
      depth: category.depth,
    });

    for (const parent of category.parentCategories ?? []) {
      registerSummary(parent);
    }

    if (category.parentCategory) {
      registerSummary(category.parentCategory);
    }
  }

  return summaryMap;
}

export function getPrimaryParentId(
  categoryId: number,
  parentMap: Map<number, number[]>,
  categoryById: Map<number, CategorySummary>,
): number | undefined {
  return pickPrimaryParentId(parentMap.get(categoryId) ?? [], categoryById);
}

function pickPrimaryParentId(
  parentIds: number[],
  categoryById: Map<number, CategorySummary>,
): number | undefined {
  if (!parentIds.length) return undefined;

  return [...parentIds].sort((leftId, rightId) => {
    const leftDepth = categoryById.get(leftId)?.depth ?? Number.MAX_SAFE_INTEGER;
    const rightDepth = categoryById.get(rightId)?.depth ?? Number.MAX_SAFE_INTEGER;

    if (leftDepth !== rightDepth) {
      return leftDepth - rightDepth;
    }

    return leftId - rightId;
  })[0];
}

export function getCategoryAncestorIds(
  categoryId: number,
  parentMap: Map<number, number[]>,
  categoryById: Map<number, CategorySummary>,
): number[] {
  const ancestors: number[] = [];
  const visited = new Set<number>();
  let currentParentIds = parentMap.get(categoryId) ?? [];

  while (currentParentIds.length > 0) {
    const parentId = pickPrimaryParentId(currentParentIds, categoryById);
    if (parentId == null || visited.has(parentId)) {
      break;
    }

    visited.add(parentId);
    ancestors.unshift(parentId);
    currentParentIds = parentMap.get(parentId) ?? [];
  }

  return ancestors;
}

export function formatCategoryBreadcrumb(
  category: Category,
  parentMap: Map<number, number[]>,
  categoryById: Map<number, CategorySummary>,
  includeSelf = true,
): string {
  const ancestorIds = getCategoryAncestorIds(category.id, parentMap, categoryById);
  const segments = ancestorIds.map((id) => categoryById.get(id)?.title ?? String(id));

  if (includeSelf) {
    segments.push(category.title);
  }

  return segments.join(PATH_SEPARATOR);
}

export function formatCategoryBreadcrumbPaths(
  category: Category,
  parentMap: Map<number, number[]>,
  categoryById: Map<number, CategorySummary>,
): string[] {
  const parentIds = parentMap.get(category.id) ?? [];

  if (!parentIds.length) {
    return [category.title];
  }

  return parentIds.map((parentId) => {
    const parentAncestors = getCategoryAncestorIds(parentId, parentMap, categoryById);
    const segments = [
      ...parentAncestors.map((id) => categoryById.get(id)?.title ?? String(id)),
      categoryById.get(parentId)?.title ?? String(parentId),
      category.title,
    ];

    return segments.join(PATH_SEPARATOR);
  });
}
