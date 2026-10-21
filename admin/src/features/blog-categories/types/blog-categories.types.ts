import {
  createEmptyLocaleFields,
  localeFieldsFromApi,
  type LocaleFieldValues,
  pickChangedLocaleFields,
} from "@/shared/lib/api/locale-fields.utils";
import { hasFormChanges, pickChangedScalar } from "@/shared/lib/form/pick-changed-fields";
import type { PaginatedResult } from "@/shared/types";

export const BLOG_CATEGORY_LOCALE_FIELDS = ["title"] as const;
export type BlogCategoryLocaleField = (typeof BLOG_CATEGORY_LOCALE_FIELDS)[number];

export type BlogCategory = {
  id: number;
  slug: string;
  sortOrder: number;
  publish: boolean;
  title?: string | null;
  translations?: LocaleFieldValues<BlogCategoryLocaleField>;
  createdAt?: string;
  updatedAt?: string;
};

export type BlogCategoryListParams = {
  page?: number;
  limit?: number;
  search?: string;
  publish?: boolean;
  sort?: string;
  direction?: "asc" | "desc";
};

export type BlogCategoryFormData = {
  translations: LocaleFieldValues<BlogCategoryLocaleField>;
  slug: string;
  sortOrder: string;
  publish: boolean;
};

export type BlogCategoryListResult = PaginatedResult<BlogCategory>;

export function createEmptyBlogCategoryForm(): BlogCategoryFormData {
  return {
    translations: createEmptyLocaleFields(BLOG_CATEGORY_LOCALE_FIELDS),
    slug: "",
    sortOrder: "0",
    publish: true,
  };
}

export function blogCategoryToFormData(blogCategory: BlogCategory): BlogCategoryFormData {
  return {
    translations: localeFieldsFromApi(blogCategory.translations, BLOG_CATEGORY_LOCALE_FIELDS),
    slug: blogCategory.slug ?? "",
    sortOrder: String(blogCategory.sortOrder ?? 0),
    publish: blogCategory.publish,
  };
}

export function pickBlogCategoryFormChanges(
  original: BlogCategoryFormData,
  current: BlogCategoryFormData,
): Partial<BlogCategoryFormData> {
  const changes: Partial<BlogCategoryFormData> = pickChangedScalar(original, current, [
    "slug",
    "sortOrder",
    "publish",
  ]);
  const translations = pickChangedLocaleFields(
    original.translations,
    current.translations,
    BLOG_CATEGORY_LOCALE_FIELDS,
  );
  if (translations) changes.translations = translations;
  return changes;
}

export function hasBlogCategoryFormChanges(original: BlogCategoryFormData, current: BlogCategoryFormData): boolean {
  return hasFormChanges(pickBlogCategoryFormChanges(original, current));
}
