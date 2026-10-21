export type LoyaltyLocale = "en" | "ar";

export type LoyaltyTranslationFields = {
  name: string;
  description?: string;
};

export type LoyaltyTranslationsInput = Partial<
  Record<LoyaltyLocale, LoyaltyTranslationFields>
>;

export function createEmptyLoyaltyTranslations(): LoyaltyTranslationsInput {
  return {
    en: { name: "", description: "" },
    ar: { name: "", description: "" },
  };
}

export function mapLoyaltyTranslationsFromApi(
  translations?: LoyaltyTranslationsInput | Record<string, unknown> | null,
  fallbackName?: string | null,
): LoyaltyTranslationsInput {
  const result = createEmptyLoyaltyTranslations();

  if (translations && typeof translations === "object") {
    for (const locale of ["en", "ar"] as const) {
      const row = translations[locale];
      if (row && typeof row === "object") {
        const record = row as Record<string, unknown>;
        result[locale] = {
          name:
            typeof record.name === "string"
              ? record.name
              : typeof record.title === "string"
                ? record.title
                : "",
          description:
            typeof record.description === "string" ? record.description : "",
        };
      }
    }
  }

  if (fallbackName?.trim() && !result.en?.name?.trim()) {
    result.en = { ...result.en, name: fallbackName };
  }

  return result;
}

export function mapLoyaltyTranslationsToApi(
  translations: LoyaltyTranslationsInput,
): Record<LoyaltyLocale, { name: string; description?: string }> {
  const payload: Record<LoyaltyLocale, { name: string; description?: string }> = {
    en: { name: translations.en?.name?.trim() ?? "" },
    ar: { name: translations.ar?.name?.trim() ?? "" },
  };

  const enDescription = translations.en?.description?.trim();
  const arDescription = translations.ar?.description?.trim();
  if (enDescription) payload.en.description = enDescription;
  if (arDescription) payload.ar.description = arDescription;

  return payload;
}

export function getLoyaltyDisplayName(
  translations: LoyaltyTranslationsInput | undefined,
  fallbackName?: string | null,
): { en: string; ar: string } {
  const mapped = mapLoyaltyTranslationsFromApi(translations, fallbackName);
  return {
    en: mapped.en?.name?.trim() ?? fallbackName?.trim() ?? "",
    ar: mapped.ar?.name?.trim() ?? "",
  };
}
