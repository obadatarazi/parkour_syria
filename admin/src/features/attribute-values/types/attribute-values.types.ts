import {
  hasFormChanges,
  pickChangedScalar,
  pickChangedTranslations,
} from "@/shared/lib/form/pick-changed-fields";
import type { TranslationsInput } from "@/shared/lib/api/form-data.utils";
import type { PaginatedResult } from "@/shared/types";

export type AttributeValueTranslation = {
  title: string;
};

export type AttributeValueAttribute = {
  id: number;
  title: string;
  translations?: Partial<Record<"en" | "ar", { title: string }>>;
};

export type AttributeValue = {
  id: number;
  title: string;
  publish: boolean;
  attribute?: AttributeValueAttribute | null;
  createdAt?: string;
  updatedAt?: string;
  translations?: Partial<Record<"en" | "ar", AttributeValueTranslation>>;
};

export type AttributeValueListParams = {
  page?: number;
  limit?: number;
  search?: string;
  publish?: boolean;
  attributeId?: number;
  sort?: string;
  direction?: "asc" | "desc";
};

export type AttributeValueFormData = {
  attributeId: number | null;
  translations: TranslationsInput;
  publish?: boolean;
};

export type AttributeValueListResult = PaginatedResult<AttributeValue>;

export function createEmptyAttributeValueForm(): AttributeValueFormData {
  return {
    attributeId: null,
    translations: {
      en: { title: "" },
      ar: { title: "" },
    },
    publish: true,
  };
}

export function attributeValueToFormData(attributeValue: AttributeValue): AttributeValueFormData {
  return {
    attributeId: attributeValue.attribute?.id ?? null,
    translations: {
      en: { title: attributeValue.translations?.en?.title ?? attributeValue.title },
      ar: { title: attributeValue.translations?.ar?.title ?? "" },
    },
    publish: attributeValue.publish,
  };
}

export function pickAttributeValueFormChanges(
  original: AttributeValueFormData,
  current: AttributeValueFormData,
): Partial<AttributeValueFormData> {
  const changes: Partial<AttributeValueFormData> = {
    ...pickChangedScalar(original, current, ["attributeId", "publish"]),
  };

  const translationChanges = pickChangedTranslations(original.translations, current.translations);
  if (translationChanges) {
    changes.translations = translationChanges;
  }

  return changes;
}

export function hasAttributeValueFormChanges(
  original: AttributeValueFormData,
  current: AttributeValueFormData,
): boolean {
  return hasFormChanges(pickAttributeValueFormChanges(original, current));
}
