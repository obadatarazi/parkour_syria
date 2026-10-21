import { apiDateTimeToInput } from "@/features/events/types/events.types";
import {
  createEmptyLocaleFields,
  localeFieldsFromApi,
  type LocaleFieldValues,
  pickChangedLocaleFields,
} from "@/shared/lib/api/locale-fields.utils";
import { hasFormChanges, pickChangedScalar } from "@/shared/lib/form/pick-changed-fields";
import type { PaginatedResult } from "@/shared/types";

export const BLOG_POST_LOCALE_FIELDS = [
  "title",
  "excerpt",
  "body",
  "author",
  "seo_title",
  "seo_description",
] as const;
export type BlogPostLocaleField = (typeof BLOG_POST_LOCALE_FIELDS)[number];

export type BlogPost = {
  id: number;
  slug: string;
  blogCategoryId?: number | null;
  category?: { id: number; slug: string; title?: string | null } | null;
  publish: boolean;
  publishedAt?: string | null;
  title?: string | null;
  excerpt?: string | null;
  author?: string | null;
  imageFileUrl?: string | null;
  translations?: LocaleFieldValues<BlogPostLocaleField>;
  createdAt?: string;
  updatedAt?: string;
};

export type BlogPostListParams = {
  page?: number;
  limit?: number;
  search?: string;
  publish?: boolean;
  blogCategoryId?: string;
  sort?: string;
  direction?: "asc" | "desc";
};

export type BlogPostFormData = {
  translations: LocaleFieldValues<BlogPostLocaleField>;
  slug: string;
  blogCategoryId: string;
  publish: boolean;
  /** `YYYY-MM-DDTHH:mm`. The backend never stamps it, so the form fills it in on publish. */
  publishedAt: string;
  image: File | null;
};

export type BlogPostListResult = PaginatedResult<BlogPost>;

export function createEmptyBlogPostForm(): BlogPostFormData {
  return {
    translations: createEmptyLocaleFields(BLOG_POST_LOCALE_FIELDS),
    slug: "",
    blogCategoryId: "",
    publish: false,
    publishedAt: "",
    image: null,
  };
}

export function blogPostToFormData(post: BlogPost): BlogPostFormData {
  return {
    translations: localeFieldsFromApi(post.translations, BLOG_POST_LOCALE_FIELDS),
    slug: post.slug ?? "",
    blogCategoryId: post.blogCategoryId ? String(post.blogCategoryId) : "",
    publish: post.publish,
    publishedAt: apiDateTimeToInput(post.publishedAt),
    image: null,
  };
}

export function pickBlogPostFormChanges(
  original: BlogPostFormData,
  current: BlogPostFormData,
): Partial<BlogPostFormData> {
  const changes: Partial<BlogPostFormData> = pickChangedScalar(original, current, [
    "slug",
    "blogCategoryId",
    "publish",
    "publishedAt",
  ]);
  const translations = pickChangedLocaleFields(
    original.translations,
    current.translations,
    BLOG_POST_LOCALE_FIELDS,
  );
  if (translations) changes.translations = translations;
  if (current.image instanceof File) changes.image = current.image;
  return changes;
}

export function hasBlogPostFormChanges(original: BlogPostFormData, current: BlogPostFormData): boolean {
  return hasFormChanges(pickBlogPostFormChanges(original, current));
}
