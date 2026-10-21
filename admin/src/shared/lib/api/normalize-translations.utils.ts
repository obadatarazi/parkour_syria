export type LocaleCode = "en" | "ar";

export type ApiTranslationRow = {
  locale?: string | null;
  title?: string | null;
  description?: string | null;
  body?: string | null;
  slug?: string | null;
  benefits?: string | null;
  ingredients?: string | null;
  usageMethod?: string | null;
  warnings?: string | null;
  countryOfOrigin?: string | null;
  country_of_origin?: string | null;
};

export type LocaleTranslations<T extends Record<string, unknown>> = Partial<
  Record<LocaleCode, T>
>;

function isLocaleCode(value: string): value is LocaleCode {
  return value === "en" || value === "ar";
}

/** Converts Laravel translation arrays (`[{ locale, title }]`) to `{ en, ar }` records. */
export function normalizeTranslationsFromApi<T extends Record<string, unknown>>(
  translations: unknown,
): LocaleTranslations<T> | undefined {
  if (!translations) return undefined;

  if (!Array.isArray(translations)) {
    return translations as LocaleTranslations<T>;
  }

  const result: LocaleTranslations<T> = {};

  for (const row of translations) {
    if (!row || typeof row !== "object") continue;
    const locale = (row as ApiTranslationRow).locale;
    if (!locale || !isLocaleCode(locale)) continue;

    const { locale: _locale, ...fields } = row as ApiTranslationRow;
    result[locale] = fields as T;
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

export function getTitleFromApiTranslations(
  translations: unknown,
  fallback = "",
): string {
  const normalized = normalizeTranslationsFromApi<{ title?: string }>(translations);
  return (
    normalized?.en?.title?.trim() ||
    normalized?.ar?.title?.trim() ||
    fallback.trim() ||
    ""
  );
}
