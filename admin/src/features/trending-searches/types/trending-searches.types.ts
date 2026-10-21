import {
  hasFormChanges,
  pickChangedScalar,
  pickChangedTranslations,
} from "@/shared/lib/form/pick-changed-fields";
import type { TranslationsInput } from "@/shared/lib/api/form-data.utils";
import type { EnumLabelValue } from "@/shared/lib/api/normalize-enum.utils";
import type { PaginatedResult } from "@/shared/types";

export type TrendingSearchTargetTypeValue =
  | "KEYWORD"
  | "BRAND"
  | "CATEGORY"
  | "PRODUCT"
  | "TAG";

export type TrendingSearchTranslation = {
  title?: string;
  label?: string;
  slug?: string;
};

export type TrendingSearch = {
  id: number;
  sortOrder: number;
  targetType?: EnumLabelValue | null;
  targetId?: number | null;
  publish: boolean;
  label: string;
  slug?: string | null;
  createdAt?: string;
  updatedAt?: string;
  translations?: Partial<Record<"en" | "ar", TrendingSearchTranslation>>;
};

export type TrendingSearchListParams = {
  page?: number;
  limit?: number;
  search?: string;
  publish?: boolean;
  targetType?: string;
  sort?: string;
  direction?: "asc" | "desc";
};

export type TrendingSearchFormData = {
  translations: TranslationsInput;
  targetType: TrendingSearchTargetTypeValue | "";
  targetId: number | null;
  publish: boolean;
  sortOrder: number;
};

export type TrendingSearchListResult = PaginatedResult<TrendingSearch>;

export function createEmptyTrendingSearchForm(): TrendingSearchFormData {
  return {
    translations: {
      en: { title: "" },
      ar: { title: "" },
    },
    targetType: "KEYWORD",
    targetId: null,
    publish: true,
    sortOrder: 0,
  };
}

export function trendingSearchToFormData(item: TrendingSearch): TrendingSearchFormData {
  const targetTypeValue = item.targetType?.value;
  const targetType: TrendingSearchTargetTypeValue | "" =
    targetTypeValue === "KEYWORD" ||
    targetTypeValue === "BRAND" ||
    targetTypeValue === "CATEGORY" ||
    targetTypeValue === "PRODUCT" ||
    targetTypeValue === "TAG"
      ? targetTypeValue
      : "";

  return {
    translations: {
      en: {
        title: item.translations?.en?.title || item.translations?.en?.label || item.label || "",
      },
      ar: {
        title: item.translations?.ar?.title || item.translations?.ar?.label || "",
      },
    },
    targetType,
    targetId: item.targetId ?? null,
    publish: item.publish,
    sortOrder: item.sortOrder ?? 0,
  };
}

export function pickTrendingSearchFormChanges(
  original: TrendingSearchFormData,
  current: TrendingSearchFormData,
): Partial<TrendingSearchFormData> {
  const changes: Partial<TrendingSearchFormData> = {
    ...pickChangedScalar(original, current, ["targetType", "targetId", "publish", "sortOrder"]),
  };

  const translationChanges = pickChangedTranslations(original.translations, current.translations);
  if (translationChanges) {
    changes.translations = translationChanges;
  }

  return changes;
}

export function hasTrendingSearchFormChanges(
  original: TrendingSearchFormData,
  current: TrendingSearchFormData,
): boolean {
  return hasFormChanges(pickTrendingSearchFormChanges(original, current));
}

export function getTrendingSearchLabel(item: TrendingSearch, fallback = "—"): string {
  return (
    item.translations?.en?.title?.trim() ||
    item.translations?.en?.label?.trim() ||
    item.label?.trim() ||
    item.translations?.ar?.title?.trim() ||
    item.translations?.ar?.label?.trim() ||
    fallback
  );
}
