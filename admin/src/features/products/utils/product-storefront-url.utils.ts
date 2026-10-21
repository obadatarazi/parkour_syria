import type { Product } from "@/features/products/types/products.types";
import { getProductBilingualSlugs } from "@/features/products/types/products.types";
import type { ProductTranslationsInput } from "@/shared/lib/api/form-data.utils";
import { env } from "@/shared/lib/env";

export type StorefrontLocale = "en" | "ar";

/**
 * Normalize a slug for a storefront path segment.
 * Decodes stored percent-encoding so Arabic slugs stay readable (not %D9%86…).
 */
export function normalizeProductSlugForUrlPath(slug: string): string {
  const normalized = slug.trim().replace(/^\/+|\/+$/g, "");
  if (!normalized) return "";

  try {
    return decodeURIComponent(normalized);
  } catch {
    return normalized;
  }
}

/** @deprecated Use normalizeProductSlugForUrlPath — kept for callers that imported this name. */
export function encodeProductSlugForUrl(slug: string): string {
  return normalizeProductSlugForUrlPath(slug);
}

export function buildProductStorefrontUrl(locale: StorefrontLocale, slug: string): string | null {
  const pathSlug = normalizeProductSlugForUrlPath(slug);
  if (!pathSlug) return null;
  return `${env.storefrontUrl}/${locale}/product/${pathSlug}`;
}

/** Decode percent-encoded path segments for clipboard / share (readable Arabic). */
export function formatProductStorefrontUrlForCopy(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;

  try {
    return decodeURI(trimmed);
  } catch {
    return trimmed;
  }
}

export function resolveProductStorefrontSlug(
  product: Pick<Product, "translations" | "slug">,
  locale: StorefrontLocale,
): string {
  const slugs = getProductBilingualSlugs(product);
  if (locale === "en") {
    return slugs.en || slugs.ar;
  }
  return slugs.ar || slugs.en;
}

export function getProductStorefrontUrlForLocale(
  product: Pick<Product, "translations" | "slug">,
  locale: StorefrontLocale,
): string | null {
  const slug = resolveProductStorefrontSlug(product, locale);
  if (!slug) return null;
  return buildProductStorefrontUrl(locale, slug);
}

export function getProductStorefrontUrlFromTranslations(
  translations: ProductTranslationsInput | undefined,
  locale: StorefrontLocale,
): string | null {
  return getProductStorefrontUrlForLocale({ translations, slug: translations?.en?.slug ?? null }, locale);
}
