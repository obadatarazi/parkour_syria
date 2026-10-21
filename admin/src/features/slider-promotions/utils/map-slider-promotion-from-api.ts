import type {
  SliderPromotion,
  SliderPromotionImage,
} from "@/features/slider-promotions/types/slider-promotions.types";
import type { PromotionTypeOption, PromotionTypeValue } from "@/shared/constants/promotion-type";
import { normalizeEnumLabelValue, normalizeTranslationsFromApi } from "@/shared/lib/api";

type RawSliderPromotion = Omit<SliderPromotion, "type" | "images"> & {
  type?: string | PromotionTypeOption | null;
  images?: SliderPromotionImage[];
  featuredImageUrl?: string | null;
  imagesCount?: number;
};

function mapSliderPromotionImageFromApi(image: SliderPromotionImage): SliderPromotionImage {
  const translations = normalizeTranslationsFromApi<{ imageFileUrl?: string | null }>(
    image.translations,
  );

  return {
    ...image,
    ...(translations ? { translations } : {}),
  };
}

function mapType(type: RawSliderPromotion["type"]): PromotionTypeOption {
  const normalized = normalizeEnumLabelValue(type);
  const value = (normalized?.value ?? "DESKTOP") as PromotionTypeValue;
  return {
    value,
    label: normalized?.label ?? value,
  };
}

export function mapSliderPromotionFromApi(promotion: RawSliderPromotion): SliderPromotion {
  const images = promotion.images?.map(mapSliderPromotionImageFromApi);

  return {
    ...promotion,
    type: mapType(promotion.type),
    featuredImageUrl:
      promotion.featuredImageUrl ?? images?.[0]?.imageFileUrl ?? null,
    imagesCount: promotion.imagesCount ?? images?.length ?? 0,
    images,
  };
}
