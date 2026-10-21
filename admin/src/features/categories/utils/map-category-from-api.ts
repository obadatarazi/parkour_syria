import type { Category, CategorySummary } from "@/features/categories/types/categories.types";
import { mapTranslatableFromApi } from "@/shared/lib/api/map-translatable-from-api.utils";
import {
  getTitleFromApiTranslations,
  normalizeTranslationsFromApi,
} from "@/shared/lib/api/normalize-translations.utils";

function mapCategorySummary(item: CategorySummary & { translations?: unknown }): CategorySummary {
  return mapTranslatableFromApi(item);
}

export function mapCategoryFromApi(category: Category): Category {
  const translations = normalizeTranslationsFromApi<{
    title?: string;
    description?: string;
  }>(category.translations);

  const children = (category.children ?? []).map(mapCategoryFromApi);
  const hasChildren =
    category.hasChildren === true ||
    (typeof category.childrenCount === "number" && category.childrenCount > 0) ||
    children.length > 0;

  return {
    ...category,
    title: getTitleFromApiTranslations(category.translations, category.title ?? ""),
    description:
      translations?.en?.description?.trim() ||
      translations?.ar?.description?.trim() ||
      category.description?.trim() ||
      "",
    ...(translations ? { translations: translations as Category["translations"] } : {}),
    parentCategories: (category.parentCategories ?? []).map(mapCategorySummary),
    parentCategory: category.parentCategory ? mapCategorySummary(category.parentCategory) : category.parentCategory,
    children,
    hasChildren,
  };
}
