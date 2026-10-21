import {
  hasFormChanges,
  pickChangedScalar,
  pickChangedTranslations,
} from "@/shared/lib/form/pick-changed-fields";
import type { TranslationsInput } from "@/shared/lib/api/form-data.utils";
import type { PaginatedResult } from "@/shared/types";

export type CountryTranslation = {
  title: string;
};

export type Country = {
  id: number;
  title: string;
  countryIso?: string | null;
  publish: boolean;
  createdAt?: string;
  updatedAt?: string;
  translations?: Partial<Record<"en" | "ar", CountryTranslation>>;
};

export type CountryListParams = {
  page?: number;
  limit?: number;
  search?: string;
  publish?: boolean;
  sort?: string;
  direction?: "asc" | "desc";
};

export type CountryFormData = {
  translations: TranslationsInput;
  countryIso?: string;
  publish?: boolean;
};

export type CountryListResult = PaginatedResult<Country>;

export function createEmptyCountryForm(): CountryFormData {
  return {
    translations: {
      en: { title: "" },
      ar: { title: "" },
    },
    countryIso: "",
    publish: true,
  };
}

export function countryToFormData(country: Country): CountryFormData {
  return {
    translations: {
      en: { title: country.translations?.en?.title ?? country.title },
      ar: { title: country.translations?.ar?.title ?? "" },
    },
    countryIso: country.countryIso ?? "",
    publish: country.publish,
  };
}

export function pickCountryFormChanges(
  original: CountryFormData,
  current: CountryFormData,
): Partial<CountryFormData> {
  const changes: Partial<CountryFormData> = {
    ...pickChangedScalar(original, current, ["publish", "countryIso"]),
  };

  const translationChanges = pickChangedTranslations(original.translations, current.translations);
  if (translationChanges) {
    changes.translations = translationChanges;
  }

  return changes;
}

export function hasCountryFormChanges(
  original: CountryFormData,
  current: CountryFormData,
): boolean {
  return hasFormChanges(pickCountryFormChanges(original, current));
}
