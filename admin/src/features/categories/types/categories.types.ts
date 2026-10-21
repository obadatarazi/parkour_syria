import {
  areNumberArraysEqual,
  hasFormChanges,
  pickChangedScalar,
  pickChangedTranslations,
} from "@/shared/lib/form/pick-changed-fields";
import type { TranslationsInput } from "@/shared/lib/api/form-data.utils";
import type { PaginatedResult } from "@/shared/types";

export type CategoryTranslation = {
  title: string;
  description?: string | null;
};

export type CategorySummary = {
  id: number;
  title: string;
  slug?: string | null;
  featureImageFileUrl?: string | null;
  depth?: number;
};

export type Category = {
  id: number;
  title: string;
  description?: string | null;
  slug?: string | null;
  publish: boolean;
  showMenu?: boolean;
  showInHomePage?: boolean;
  feature?: boolean;
  featureImageFileUrl?: string | null;
  parentCategories?: CategorySummary[];
  parentCategory?: CategorySummary | null;
  depth?: number;
  children?: Category[];
  /** Backend flag — true when children exist even if `children` is not embedded. */
  hasChildren?: boolean;
  childrenCount?: number;
  translations?: Partial<Record<"en" | "ar", CategoryTranslation>>;
};

export type CategoryListParams = {
  page?: number;
  limit?: number;
  search?: string;
  publish?: boolean;
  showMenu?: boolean;
  showInHomePage?: boolean;
  feature?: boolean;
  rootOnly?: boolean;
  parentCategoryId?: number;
  depth?: number;
  sort?: string;
  direction?: "asc" | "desc";
};

export type CategoryFormData = {
  translations: TranslationsInput;
  publish?: boolean;
  showMenu?: boolean;
  showInHomePage?: boolean;
  feature?: boolean;
  parentCategoryIds: number[];
  featureImage?: File | null;
};

export type CategoryListResult = PaginatedResult<Category>;

export function createEmptyCategoryForm(): CategoryFormData {
  return {
    translations: {
      en: { title: "", description: "" },
      ar: { title: "", description: "" },
    },
    publish: true,
    showMenu: true,
    showInHomePage: false,
    feature: false,
    parentCategoryIds: [],
    featureImage: null,
  };
}

export function categoryToFormData(category: Category): CategoryFormData {
  return {
    translations: {
      en: {
        title: category.translations?.en?.title ?? category.title,
        description: category.translations?.en?.description ?? category.description ?? "",
      },
      ar: {
        title: category.translations?.ar?.title ?? "",
        description: category.translations?.ar?.description ?? "",
      },
    },
    publish: category.publish,
    showMenu: category.showMenu ?? false,
    showInHomePage: category.showInHomePage ?? false,
    feature: category.feature ?? false,
    parentCategoryIds:
      category.parentCategories?.map((parent) => parent.id) ??
      (category.parentCategory ? [category.parentCategory.id] : []),
    featureImage: null,
  };
}

export function pickCategoryFormChanges(
  original: CategoryFormData,
  current: CategoryFormData,
): Partial<CategoryFormData> {
  const changes: Partial<CategoryFormData> = {
    ...pickChangedScalar(original, current, ["publish", "showMenu", "showInHomePage", "feature"]),
  };

  if (!areNumberArraysEqual(original.parentCategoryIds, current.parentCategoryIds)) {
    changes.parentCategoryIds = current.parentCategoryIds;
  }

  const translationChanges = pickChangedTranslations(original.translations, current.translations);
  if (translationChanges) {
    changes.translations = translationChanges;
  }

  if (current.featureImage instanceof File) {
    changes.featureImage = current.featureImage;
  }

  return changes;
}

export function hasCategoryFormChanges(
  original: CategoryFormData,
  current: CategoryFormData,
): boolean {
  return hasFormChanges(pickCategoryFormChanges(original, current));
}
