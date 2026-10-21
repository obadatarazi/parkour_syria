import {
  createEmptyLocaleFields,
  localeFieldsFromApi,
  type LocaleFieldValues,
  pickChangedLocaleFields,
} from "@/shared/lib/api/locale-fields.utils";
import { hasFormChanges, pickChangedScalar } from "@/shared/lib/form/pick-changed-fields";
import type { PaginatedResult } from "@/shared/types";

export const AREA_LOCALE_FIELDS = ["name"] as const;
export type AreaLocaleField = (typeof AREA_LOCALE_FIELDS)[number];

export type Area = {
  id: number;
  slug: string;
  sortOrder: number;
  publish: boolean;
  name?: string | null;
  translations?: LocaleFieldValues<AreaLocaleField>;
  createdAt?: string;
  updatedAt?: string;
};

export type AreaListParams = {
  page?: number;
  limit?: number;
  search?: string;
  publish?: boolean;
  sort?: string;
  direction?: "asc" | "desc";
};

export type AreaFormData = {
  translations: LocaleFieldValues<AreaLocaleField>;
  slug: string;
  sortOrder: string;
  publish: boolean;
};

export type AreaListResult = PaginatedResult<Area>;

export function createEmptyAreaForm(): AreaFormData {
  return {
    translations: createEmptyLocaleFields(AREA_LOCALE_FIELDS),
    slug: "",
    sortOrder: "0",
    publish: true,
  };
}

export function areaToFormData(area: Area): AreaFormData {
  return {
    translations: localeFieldsFromApi(area.translations, AREA_LOCALE_FIELDS),
    slug: area.slug ?? "",
    sortOrder: String(area.sortOrder ?? 0),
    publish: area.publish,
  };
}

export function pickAreaFormChanges(
  original: AreaFormData,
  current: AreaFormData,
): Partial<AreaFormData> {
  const changes: Partial<AreaFormData> = pickChangedScalar(original, current, [
    "slug",
    "sortOrder",
    "publish",
  ]);
  const translations = pickChangedLocaleFields(
    original.translations,
    current.translations,
    AREA_LOCALE_FIELDS,
  );
  if (translations) changes.translations = translations;
  return changes;
}

export function hasAreaFormChanges(original: AreaFormData, current: AreaFormData): boolean {
  return hasFormChanges(pickAreaFormChanges(original, current));
}
