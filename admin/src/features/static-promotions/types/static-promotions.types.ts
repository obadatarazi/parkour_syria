import {
  hasFormChanges,
  pickChangedScalar,
} from "@/shared/lib/form/pick-changed-fields";
import type { LocaleCode } from "@/shared/lib/api/form-data.utils";
import type { PromotionTypeOption, PromotionTypeValue } from "@/shared/constants/promotion-type";
import type { PaginatedResult } from "@/shared/types";
import type { LocaleImageUploadValue } from "@/shared/components/forms/LocaleImageUploadFields";

export type StaticPromotionTranslation = {
  imageFileUrl?: string | null;
};

export type StaticPromotion = {
  id: number;
  publish: boolean;
  link?: string | null;
  position: number;
  type: PromotionTypeOption;
  imageFileUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
  translations?: Partial<Record<LocaleCode, StaticPromotionTranslation>>;
};

export type StaticPromotionListParams = {
  page?: number;
  limit?: number;
  publish?: boolean;
  type?: PromotionTypeValue;
  position?: number;
  sort?: string;
  direction?: "asc" | "desc";
};

export type StaticPromotionFormData = {
  publish?: boolean;
  link?: string;
  position: number;
  type: PromotionTypeValue;
  translations: LocaleImageUploadValue;
};

export type StaticPromotionListResult = PaginatedResult<StaticPromotion>;

export function createEmptyStaticPromotionForm(): StaticPromotionFormData {
  return {
    publish: true,
    link: "",
    position: 0,
    type: "DESKTOP",
    translations: {
      en: { file: null, previewUrl: null },
      ar: { file: null, previewUrl: null },
    },
  };
}

export function staticPromotionToFormData(promotion: StaticPromotion): StaticPromotionFormData {
  return {
    publish: promotion.publish,
    link: promotion.link ?? "",
    position: promotion.position,
    type: promotion.type.value,
    translations: {
      en: {
        file: null,
        previewUrl: promotion.translations?.en?.imageFileUrl ?? promotion.imageFileUrl ?? null,
      },
      ar: {
        file: null,
        previewUrl: promotion.translations?.ar?.imageFileUrl ?? null,
      },
    },
  };
}

function pickChangedImageTranslations(
  original: LocaleImageUploadValue,
  current: LocaleImageUploadValue,
): LocaleImageUploadValue | undefined {
  const locales = new Set([...Object.keys(original), ...Object.keys(current)]) as Set<LocaleCode>;
  const changed: LocaleImageUploadValue = {};
  let hasChanges = false;

  for (const locale of locales) {
    const currentFile = current[locale]?.file;
    if (currentFile instanceof File) {
      hasChanges = true;
      changed[locale] = { file: currentFile };
    }
  }

  return hasChanges ? changed : undefined;
}

export function pickStaticPromotionFormChanges(
  original: StaticPromotionFormData,
  current: StaticPromotionFormData,
): Partial<StaticPromotionFormData> {
  const changes: Partial<StaticPromotionFormData> = {
    ...pickChangedScalar(original, current, ["publish", "link", "position", "type"]),
  };

  const translationChanges = pickChangedImageTranslations(original.translations, current.translations);
  if (translationChanges) {
    changes.translations = translationChanges;
  }

  return changes;
}

export function hasStaticPromotionFormChanges(
  original: StaticPromotionFormData,
  current: StaticPromotionFormData,
): boolean {
  return hasFormChanges(pickStaticPromotionFormChanges(original, current));
}
