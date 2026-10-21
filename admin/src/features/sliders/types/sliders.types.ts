import type { Translation } from "@/shared/design-system/localization/locales/en";
import {
  createEmptyLocaleFields,
  localeFieldsFromApi,
  type LocaleFieldValues,
  pickChangedLocaleFields,
} from "@/shared/lib/api/locale-fields.utils";
import { hasFormChanges, pickChangedScalar } from "@/shared/lib/form/pick-changed-fields";
import type { PaginatedResult } from "@/shared/types";

/**
 * Where a slide's buttons can lead: the keys of the backend's `config/site.php` website_paths, which
 * the public site resolves to its own routes.
 */
export const SITE_PATH_KEYS = [
  "home",
  "what",
  "path",
  "directory",
  "events",
  "suggest",
  "blog",
  "book",
  "about",
  "contact",
  "disclaimer",
] as const;

export const SLIDER_LOCALE_FIELDS = [
  "badge",
  "title",
  "description",
  "primary_button_text",
  "secondary_button_text",
] as const;
export type SliderLocaleField = (typeof SLIDER_LOCALE_FIELDS)[number];

export type Slider = {
  id: number;
  sortOrder: number;
  publish: boolean;
  primaryPage?: string | null;
  secondaryPage?: string | null;
  title?: string | null;
  imageFileUrl?: string | null;
  translations?: LocaleFieldValues<SliderLocaleField>;
  createdAt?: string;
  updatedAt?: string;
};

export type SliderListParams = {
  page?: number;
  limit?: number;
  search?: string;
  publish?: boolean;
  sort?: string;
  direction?: "asc" | "desc";
};

export type SliderFormData = {
  translations: LocaleFieldValues<SliderLocaleField>;
  sortOrder: string;
  publish: boolean;
  primaryPage: string;
  secondaryPage: string;
  image: File | null;
};

export type SliderListResult = PaginatedResult<Slider>;

export function sitePathLabel(t: Translation, key: string): string {
  const labels: Record<string, string> = {
    home: t.sitePathHome,
    what: t.sitePathWhat,
    path: t.sitePathPath,
    directory: t.sitePathDirectory,
    events: t.sitePathEvents,
    suggest: t.sitePathSuggest,
    blog: t.sitePathBlog,
    book: t.sitePathBook,
    about: t.sitePathAbout,
    contact: t.sitePathContact,
    disclaimer: t.sitePathDisclaimer,
  };
  return labels[key] ?? key;
}

export function createEmptySliderForm(): SliderFormData {
  return {
    translations: createEmptyLocaleFields(SLIDER_LOCALE_FIELDS),
    sortOrder: "0",
    publish: true,
    primaryPage: "",
    secondaryPage: "",
    image: null,
  };
}

export function sliderToFormData(slider: Slider): SliderFormData {
  return {
    translations: localeFieldsFromApi(slider.translations, SLIDER_LOCALE_FIELDS),
    sortOrder: String(slider.sortOrder ?? 0),
    publish: slider.publish,
    primaryPage: slider.primaryPage ?? "",
    secondaryPage: slider.secondaryPage ?? "",
    image: null,
  };
}

export function pickSliderFormChanges(
  original: SliderFormData,
  current: SliderFormData,
): Partial<SliderFormData> {
  const changes: Partial<SliderFormData> = pickChangedScalar(original, current, [
    "sortOrder",
    "publish",
    "primaryPage",
    "secondaryPage",
  ]);
  const translations = pickChangedLocaleFields(
    original.translations,
    current.translations,
    SLIDER_LOCALE_FIELDS,
  );
  if (translations) changes.translations = translations;
  if (current.image instanceof File) changes.image = current.image;
  return changes;
}

export function hasSliderFormChanges(original: SliderFormData, current: SliderFormData): boolean {
  return hasFormChanges(pickSliderFormChanges(original, current));
}
