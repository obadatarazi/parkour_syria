import type { LocaleCode } from "@/shared/lib/api/form-data.utils";
import { normalizedStringEqual } from "@/shared/lib/form/pick-changed-fields";

/**
 * Translated fields keyed by the backend's own column names (`title`, `seo_title`, ...), so the
 * form state, the API response rows and the multipart payload all use one spelling.
 */
export type LocaleFieldValues<TField extends string = string> = Partial<
  Record<LocaleCode, Partial<Record<TField, string>>>
>;

/** Arabic is the live language, so it is listed (and validated) first. */
export const LOCALE_ORDER: LocaleCode[] = ["ar", "en"];

export function createEmptyLocaleFields<TField extends string>(
  fields: readonly TField[],
): LocaleFieldValues<TField> {
  const empty = Object.fromEntries(fields.map((field) => [field, ""])) as Record<TField, string>;
  return { ar: { ...empty }, en: { ...empty } };
}

/** Reads the `{ ar: {...}, en: {...} }` translations a Parkour resource returns into form state. */
export function localeFieldsFromApi<TField extends string>(
  translations: unknown,
  fields: readonly TField[],
): LocaleFieldValues<TField> {
  const source = (translations && typeof translations === "object" ? translations : {}) as Record<
    string,
    Record<string, unknown> | undefined
  >;
  const result: LocaleFieldValues<TField> = {};

  for (const locale of LOCALE_ORDER) {
    const row = source[locale] ?? {};
    result[locale] = Object.fromEntries(
      fields.map((field) => {
        const value = row[field];
        return [field, typeof value === "string" ? value : ""];
      }),
    ) as Record<TField, string>;
  }

  return result;
}

/**
 * Appends `translations[locale][field]`. A locale without its required field is skipped whole, which
 * is how English stays optional while Arabic is the only live language. Empty optional fields are
 * still sent so an edit can clear them.
 */
export function appendLocaleFields<TField extends string>(
  formData: FormData,
  translations: LocaleFieldValues<TField>,
  requiredField: TField,
): void {
  for (const locale of LOCALE_ORDER) {
    const row = translations[locale];
    if (!row || !(row[requiredField] ?? "").trim()) continue;

    for (const [field, value] of Object.entries(row) as [TField, string | undefined][]) {
      formData.append(`translations[${locale}][${field}]`, (value ?? "").trim());
    }
  }
}

/** Returns the full row of every locale with at least one changed field, or undefined. */
export function pickChangedLocaleFields<TField extends string>(
  original: LocaleFieldValues<TField>,
  current: LocaleFieldValues<TField>,
  fields: readonly TField[],
): LocaleFieldValues<TField> | undefined {
  const changed: LocaleFieldValues<TField> = {};
  let hasChanges = false;

  for (const locale of LOCALE_ORDER) {
    const localeChanged = fields.some(
      (field) => !normalizedStringEqual(original[locale]?.[field], current[locale]?.[field]),
    );
    if (!localeChanged) continue;
    hasChanges = true;
    changed[locale] = { ...current[locale] };
  }

  return hasChanges ? changed : undefined;
}

/** `{ en, ar }` of one translated field, the shape `BilingualText` draws. */
export function getBilingualField(
  translations: unknown,
  field: string,
  fallback?: string | null,
): { en: string; ar: string } {
  const source = (translations && typeof translations === "object" ? translations : {}) as Record<
    string,
    Record<string, unknown> | undefined
  >;
  const read = (locale: LocaleCode) => {
    const value = source[locale]?.[field];
    return typeof value === "string" ? value.trim() : "";
  };
  const ar = read("ar");
  const en = read("en");
  if (ar || en) return { ar, en };
  return { ar: fallback?.trim() ?? "", en: "" };
}

/** The Arabic value of a translated field, falling back to English, then to `fallback`. */
export function pickLocaleText(
  translations: unknown,
  field: string,
  fallback?: string | null,
): string {
  const source = (translations && typeof translations === "object" ? translations : {}) as Record<
    string,
    Record<string, unknown> | undefined
  >;
  for (const locale of LOCALE_ORDER) {
    const value = source[locale]?.[field];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return fallback?.trim() ?? "";
}
