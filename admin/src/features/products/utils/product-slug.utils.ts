import type { ProductFormData } from "@/features/products/types/products.types";
import { slugifyArabicTitle, slugifyEnglishTitle } from "@/shared/lib/slug.utils";

export type ProductSlugLocale = "en" | "ar";

export type ProductSlugUpdatePrompt = {
  locale: ProductSlugLocale;
  suggestedSlug: string;
  currentSlug: string;
};

export function getPredictedProductSlug(locale: ProductSlugLocale, title: string): string {
  const trimmed = title.trim();
  if (!trimmed) return "";
  return locale === "en" ? slugifyEnglishTitle(trimmed) : slugifyArabicTitle(trimmed);
}

export function shouldAutoSuggestProductSlug(
  locale: ProductSlugLocale,
  previousTitle: string,
  currentSlug: string | undefined,
): boolean {
  const slug = currentSlug?.trim() ?? "";
  if (!slug) return true;
  return slug === getPredictedProductSlug(locale, previousTitle);
}

export function getLocalesNeedingSlugUpdatePrompt(
  original: ProductFormData,
  current: ProductFormData,
): ProductSlugUpdatePrompt[] {
  const prompts: ProductSlugUpdatePrompt[] = [];

  for (const locale of ["en", "ar"] as const) {
    const originalTitle = original.translations[locale]?.title?.trim() ?? "";
    const currentTitle = current.translations[locale]?.title?.trim() ?? "";

    if (!currentTitle || originalTitle === currentTitle) {
      continue;
    }

    const originalSlug = original.translations[locale]?.slug?.trim() ?? "";
    const currentSlug = current.translations[locale]?.slug?.trim() ?? "";

    if (currentSlug !== originalSlug) {
      continue;
    }

    prompts.push({
      locale,
      suggestedSlug: getPredictedProductSlug(locale, currentTitle),
      currentSlug: originalSlug,
    });
  }

  return prompts;
}
