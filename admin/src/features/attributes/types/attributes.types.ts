import type { TranslationsInput } from "@/shared/lib/api/form-data.utils";
import {
  hasFormChanges,
  pickChangedScalar,
  pickChangedTranslations,
} from "@/shared/lib/form/pick-changed-fields";
import type { PaginatedResult } from "@/shared/types";

export type AttributeTranslation = {
  title: string;
};

export type AttributeValueSummary = {
  id: number;
  title: string;
  translations?: Partial<Record<"en" | "ar", { title: string }>>;
};

/** Slim list preview: locale → title string (not nested `{ title }`). */
export type AttributeValueTitlePreview = Partial<Record<"en" | "ar", string>>;

export type Attribute = {
  id: number;
  title: string;
  publish: boolean;
  /** Details — full value summaries. */
  values?: AttributeValueSummary[];
  /** Slim list — total value count. */
  valuesCount?: number;
  /** Slim list — first few EN/AR titles for badges. */
  valueTitles?: AttributeValueTitlePreview[];
  createdAt?: string;
  updatedAt?: string;
  translations?: Partial<Record<"en" | "ar", AttributeTranslation>>;
};

export type AttributeListParams = {
  page?: number;
  limit?: number;
  search?: string;
  publish?: boolean;
  sort?: string;
  direction?: "asc" | "desc";
};

export type AttributeFormData = {
  translations: TranslationsInput;
  publish?: boolean;
};

export type AttributeListResult = PaginatedResult<Attribute>;

export function createEmptyAttributeForm(): AttributeFormData {
  return {
    translations: {
      en: { title: "" },
      ar: { title: "" },
    },
    publish: true,
  };
}

export function attributeToFormData(attribute: Attribute): AttributeFormData {
  return {
    translations: {
      en: { title: attribute.translations?.en?.title ?? attribute.title },
      ar: { title: attribute.translations?.ar?.title ?? "" },
    },
    publish: attribute.publish,
  };
}

export function pickAttributeFormChanges(
  original: AttributeFormData,
  current: AttributeFormData,
): Partial<AttributeFormData> {
  const changes: Partial<AttributeFormData> = {
    ...pickChangedScalar(original, current, ["publish"]),
  };

  const translationChanges = pickChangedTranslations(original.translations, current.translations);
  if (translationChanges) {
    changes.translations = translationChanges;
  }

  return changes;
}

export function hasAttributeFormChanges(
  original: AttributeFormData,
  current: AttributeFormData,
): boolean {
  return hasFormChanges(pickAttributeFormChanges(original, current));
}
