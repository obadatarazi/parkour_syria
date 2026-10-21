import {
  hasFormChanges,
  pickChangedScalar,
  pickChangedTranslations,
} from "@/shared/lib/form/pick-changed-fields";
import type { TranslationsInput } from "@/shared/lib/api/form-data.utils";
import type { PaginatedResult } from "@/shared/types";

export type TagTranslation = {
  title: string;
};

export type Tag = {
  id: number;
  title: string;
  slug?: string;
  publish: boolean;
  createdAt?: string;
  updatedAt?: string;
  translations?: Partial<Record<"en" | "ar", TagTranslation>>;
};

export type TagListParams = {
  page?: number;
  limit?: number;
  search?: string;
  publish?: boolean;
  sort?: string;
  direction?: "asc" | "desc";
};

export type TagFormData = {
  translations: TranslationsInput;
  publish?: boolean;
};

export type TagListResult = PaginatedResult<Tag>;

export function createEmptyTagForm(): TagFormData {
  return {
    translations: {
      en: { title: "" },
      ar: { title: "" },
    },
    publish: true,
  };
}

export function tagToFormData(tag: Tag): TagFormData {
  return {
    translations: {
      en: { title: tag.translations?.en?.title ?? tag.title },
      ar: { title: tag.translations?.ar?.title ?? "" },
    },
    publish: tag.publish,
  };
}

export function pickTagFormChanges(
  original: TagFormData,
  current: TagFormData,
): Partial<TagFormData> {
  const changes: Partial<TagFormData> = {
    ...pickChangedScalar(original, current, ["publish"]),
  };

  const translationChanges = pickChangedTranslations(original.translations, current.translations);
  if (translationChanges) {
    changes.translations = translationChanges;
  }

  return changes;
}

export function hasTagFormChanges(original: TagFormData, current: TagFormData): boolean {
  return hasFormChanges(pickTagFormChanges(original, current));
}
