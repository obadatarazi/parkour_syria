import type { TrendingSearch } from "@/features/trending-searches/types/trending-searches.types";
import { normalizeEnumLabelValue } from "@/shared/lib/api/normalize-enum.utils";
import { normalizeTranslationsFromApi } from "@/shared/lib/api/normalize-translations.utils";

function toNumber(value: unknown, fallback = 0): number {
  if (value == null || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toNullableNumber(value: unknown): number | null {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function mapTrendingSearchFromApi(item: TrendingSearch): TrendingSearch {
  const translations = normalizeTranslationsFromApi<{
    title?: string;
    label?: string;
    slug?: string;
  }>(item.translations);

  const enLabel =
    translations?.en?.label?.trim() ||
    translations?.en?.title?.trim() ||
    item.label?.trim() ||
    "";
  const arLabel = translations?.ar?.label?.trim() || translations?.ar?.title?.trim() || "";

  return {
    ...item,
    sortOrder: toNumber(item.sortOrder),
    targetId: toNullableNumber(item.targetId),
    targetType: normalizeEnumLabelValue(item.targetType),
    publish: Boolean(item.publish),
    label: enLabel || item.label || "",
    slug: item.slug ?? translations?.en?.slug ?? null,
    translations: {
      en: {
        title: enLabel,
        label: enLabel,
        slug: translations?.en?.slug,
      },
      ar: {
        title: arLabel,
        label: arLabel,
        slug: translations?.ar?.slug,
      },
    },
  };
}
