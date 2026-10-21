import type { Translation } from "@/shared/design-system/localization/locales/en";
import {
  localeFieldsFromApi,
  type LocaleFieldValues,
  pickChangedLocaleFields,
} from "@/shared/lib/api/locale-fields.utils";
import { hasFormChanges, pickChangedScalar } from "@/shared/lib/form/pick-changed-fields";
import type { PaginatedResult } from "@/shared/types";

/** The site's fixed pages. They are seeded by the backend and edited, never created or deleted. */
export const PAGE_KEYS = ["home", "what", "about", "contact", "disclaimer", "book"] as const;
export type PageKey = (typeof PAGE_KEYS)[number];

export const PAGE_LOCALE_FIELDS = ["title", "body", "seo_title", "seo_description"] as const;
export type PageLocaleField = (typeof PAGE_LOCALE_FIELDS)[number];

export type SitePage = {
  id: number;
  key: PageKey | string;
  publish: boolean;
  title?: string | null;
  imageFileUrl?: string | null;
  translations?: LocaleFieldValues<PageLocaleField>;
  createdAt?: string;
  updatedAt?: string;
};

export type PageListParams = {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  direction?: "asc" | "desc";
};

export type PageFormData = {
  translations: LocaleFieldValues<PageLocaleField>;
  publish: boolean;
  image: File | null;
};

export type PageListResult = PaginatedResult<SitePage>;

export function pageKeyLabel(t: Translation, key: string): string {
  switch (key) {
    case "home":
      return t.pageKeyHome;
    case "what":
      return t.pageKeyWhat;
    case "about":
      return t.pageKeyAbout;
    case "contact":
      return t.pageKeyContact;
    case "disclaimer":
      return t.pageKeyDisclaimer;
    case "book":
      return t.pageKeyBook;
    default:
      return key;
  }
}

export function pageToFormData(page: SitePage): PageFormData {
  return {
    translations: localeFieldsFromApi(page.translations, PAGE_LOCALE_FIELDS),
    publish: page.publish,
    image: null,
  };
}

export function pickPageFormChanges(
  original: PageFormData,
  current: PageFormData,
): Partial<PageFormData> {
  const changes: Partial<PageFormData> = pickChangedScalar(original, current, ["publish"]);
  const translations = pickChangedLocaleFields(
    original.translations,
    current.translations,
    PAGE_LOCALE_FIELDS,
  );
  if (translations) changes.translations = translations;
  if (current.image instanceof File) changes.image = current.image;
  return changes;
}

export function hasPageFormChanges(original: PageFormData, current: PageFormData): boolean {
  return hasFormChanges(pickPageFormChanges(original, current));
}
