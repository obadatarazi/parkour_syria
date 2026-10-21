import {
  createEmptyLocaleFields,
  localeFieldsFromApi,
  type LocaleFieldValues,
  pickChangedLocaleFields,
} from "@/shared/lib/api/locale-fields.utils";
import { hasFormChanges, pickChangedScalar } from "@/shared/lib/form/pick-changed-fields";
import type { PaginatedResult } from "@/shared/types";

export const LESSON_LOCALE_FIELDS = ["title", "summary", "body", "safety_note"] as const;
export type LessonLocaleField = (typeof LESSON_LOCALE_FIELDS)[number];

export type Lesson = {
  id: number;
  slug: string;
  sortOrder: number;
  youtubeUrl?: string | null;
  publish: boolean;
  title?: string | null;
  summary?: string | null;
  imageFileUrl?: string | null;
  translations?: LocaleFieldValues<LessonLocaleField>;
  createdAt?: string;
  updatedAt?: string;
};

export type LessonListParams = {
  page?: number;
  limit?: number;
  search?: string;
  publish?: boolean;
  sort?: string;
  direction?: "asc" | "desc";
};

export type LessonFormData = {
  translations: LocaleFieldValues<LessonLocaleField>;
  slug: string;
  sortOrder: string;
  youtubeUrl: string;
  publish: boolean;
  image: File | null;
};

export type LessonListResult = PaginatedResult<Lesson>;

export function createEmptyLessonForm(): LessonFormData {
  return {
    translations: createEmptyLocaleFields(LESSON_LOCALE_FIELDS),
    slug: "",
    sortOrder: "0",
    youtubeUrl: "",
    publish: true,
    image: null,
  };
}

export function lessonToFormData(lesson: Lesson): LessonFormData {
  return {
    translations: localeFieldsFromApi(lesson.translations, LESSON_LOCALE_FIELDS),
    slug: lesson.slug ?? "",
    sortOrder: String(lesson.sortOrder ?? 0),
    youtubeUrl: lesson.youtubeUrl ?? "",
    publish: lesson.publish,
    image: null,
  };
}

export function pickLessonFormChanges(
  original: LessonFormData,
  current: LessonFormData,
): Partial<LessonFormData> {
  const changes: Partial<LessonFormData> = pickChangedScalar(original, current, [
    "slug",
    "sortOrder",
    "youtubeUrl",
    "publish",
  ]);
  const translations = pickChangedLocaleFields(
    original.translations,
    current.translations,
    LESSON_LOCALE_FIELDS,
  );
  if (translations) changes.translations = translations;
  if (current.image instanceof File) changes.image = current.image;
  return changes;
}

export function hasLessonFormChanges(original: LessonFormData, current: LessonFormData): boolean {
  return hasFormChanges(pickLessonFormChanges(original, current));
}
