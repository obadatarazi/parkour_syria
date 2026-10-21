import {
  areNumberArraysEqual,
  hasFormChanges,
  pickChangedScalar,
} from "@/shared/lib/form/pick-changed-fields";
import type { PromotionTypeOption, PromotionTypeValue } from "@/shared/constants/promotion-type";
import type { LocaleImageUploadValue } from "@/shared/components/forms/LocaleImageUploadFields";
import type { PaginatedResult } from "@/shared/types";

export type SliderPromotionImage = {
  id: number;
  sliderPromotionId?: number;
  imageFileUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
  translations?: Partial<
    Record<"en" | "ar", { imageFileUrl?: string | null }>
  >;
};

export type SliderPromotionImageFormItem = {
  id?: number;
  translations: LocaleImageUploadValue;
};

export type SliderPromotion = {
  id: number;
  publish: boolean;
  link?: string | null;
  position: number;
  type: PromotionTypeOption;
  /** Slim list thumbnail. */
  featuredImageUrl?: string | null;
  /** Slim list count. */
  imagesCount?: number;
  /** Details — full image rows for the edit form. */
  images?: SliderPromotionImage[];
  createdAt?: string;
  updatedAt?: string;
};

export type SliderPromotionListParams = {
  page?: number;
  limit?: number;
  publish?: boolean;
  type?: PromotionTypeValue;
  position?: number;
  sort?: string;
  direction?: "asc" | "desc";
};

export type SliderPromotionFormData = {
  publish?: boolean;
  link?: string;
  position: number;
  type: PromotionTypeValue;
  images: SliderPromotionImageFormItem[];
  deletedImageIds: number[];
};

export type SliderPromotionListResult = PaginatedResult<SliderPromotion>;

function createEmptyImageItem(): SliderPromotionImageFormItem {
  return {
    translations: {
      en: { file: null, previewUrl: null },
      ar: { file: null, previewUrl: null },
    },
  };
}

export function createEmptySliderPromotionForm(): SliderPromotionFormData {
  return {
    publish: true,
    link: "",
    position: 0,
    type: "DESKTOP",
    images: [createEmptyImageItem()],
    deletedImageIds: [],
  };
}

export function sliderPromotionImageToFormItem(
  image: SliderPromotionImage,
): SliderPromotionImageFormItem {
  return {
    id: image.id,
    translations: {
      en: {
        file: null,
        previewUrl: image.translations?.en?.imageFileUrl ?? image.imageFileUrl ?? null,
      },
      ar: {
        file: null,
        previewUrl: image.translations?.ar?.imageFileUrl ?? null,
      },
    },
  };
}

export function sliderPromotionToFormData(promotion: SliderPromotion): SliderPromotionFormData {
  const images = promotion.images ?? [];
  return {
    publish: promotion.publish,
    link: promotion.link ?? "",
    position: promotion.position,
    type: promotion.type.value,
    images: images.length
      ? images.map(sliderPromotionImageToFormItem)
      : [createEmptyImageItem()],
    deletedImageIds: [],
  };
}

function pickChangedPromotionImages(
  original: SliderPromotionImageFormItem[],
  current: SliderPromotionImageFormItem[],
): SliderPromotionImageFormItem[] | undefined {
  const changed: SliderPromotionImageFormItem[] = [];
  let hasChanges = false;

  for (const image of current) {
    const locales = Object.entries(image.translations).filter(
      ([, translation]) => translation?.file instanceof File,
    );

    if (locales.length === 0 && !image.id) continue;

    if (locales.length > 0 || image.id) {
      hasChanges = true;
      changed.push(image);
    }
  }

  const originalIds = new Set(original.map((image) => image.id).filter(Boolean) as number[]);
  const currentIds = new Set(current.map((image) => image.id).filter(Boolean) as number[]);
  const removedIds = [...originalIds].filter((id) => !currentIds.has(id));

  if (removedIds.length > 0) {
    hasChanges = true;
  }

  return hasChanges ? changed : undefined;
}

export function pickSliderPromotionFormChanges(
  original: SliderPromotionFormData,
  current: SliderPromotionFormData,
): Partial<SliderPromotionFormData> {
  const changes: Partial<SliderPromotionFormData> = {
    ...pickChangedScalar(original, current, ["publish", "link", "position", "type"]),
  };

  const imageChanges = pickChangedPromotionImages(original.images, current.images);
  if (imageChanges) {
    changes.images = imageChanges;
  }

  if (!areNumberArraysEqual(original.deletedImageIds, current.deletedImageIds)) {
    changes.deletedImageIds = current.deletedImageIds;
  }

  return changes;
}

export function hasSliderPromotionFormChanges(
  original: SliderPromotionFormData,
  current: SliderPromotionFormData,
): boolean {
  return hasFormChanges(pickSliderPromotionFormChanges(original, current));
}

export { createEmptyImageItem };
