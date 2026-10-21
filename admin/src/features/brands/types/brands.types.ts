import {
  hasFormChanges,
  pickChangedScalar,
  pickChangedTranslations,
} from "@/shared/lib/form/pick-changed-fields";
import type { TranslationsInput } from "@/shared/lib/api/form-data.utils";
import type { PaginatedResult } from "@/shared/types";

export type BrandTranslation = {
  title: string;
  description?: string | null;
};

export type Brand = {
  id: number;
  title: string;
  description?: string | null;
  publish: boolean;
  logoFileUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
  translations?: Partial<Record<"en" | "ar", BrandTranslation>>;
};

export type BrandListParams = {
  page?: number;
  limit?: number;
  search?: string;
  publish?: boolean;
  sort?: string;
  direction?: "asc" | "desc";
};

export type BrandFormData = {
  translations: TranslationsInput;
  publish?: boolean;
  logo?: File | null;
};

export type BrandListResult = PaginatedResult<Brand>;

export function createEmptyBrandForm(): BrandFormData {
  return {
    translations: {
      en: { title: "", description: "" },
      ar: { title: "", description: "" },
    },
    publish: true,
    logo: null,
  };
}

export function brandToFormData(brand: Brand): BrandFormData {
  return {
    translations: {
      en: {
        title: brand.translations?.en?.title ?? brand.title,
        description: brand.translations?.en?.description ?? brand.description ?? "",
      },
      ar: {
        title: brand.translations?.ar?.title ?? "",
        description: brand.translations?.ar?.description ?? "",
      },
    },
    publish: brand.publish,
    logo: null,
  };
}

export function pickBrandFormChanges(
  original: BrandFormData,
  current: BrandFormData,
): Partial<BrandFormData> {
  const changes: Partial<BrandFormData> = {
    ...pickChangedScalar(original, current, ["publish"]),
  };

  const translationChanges = pickChangedTranslations(original.translations, current.translations);
  if (translationChanges) {
    changes.translations = translationChanges;
  }

  if (current.logo instanceof File) {
    changes.logo = current.logo;
  }

  return changes;
}

export function hasBrandFormChanges(
  original: BrandFormData,
  current: BrandFormData,
): boolean {
  return hasFormChanges(pickBrandFormChanges(original, current));
}
