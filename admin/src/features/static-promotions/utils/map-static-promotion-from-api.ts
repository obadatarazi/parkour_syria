import type { StaticPromotion } from "@/features/static-promotions/types/static-promotions.types";
import { normalizeTranslationsFromApi } from "@/shared/lib/api";

export function mapStaticPromotionFromApi(promotion: StaticPromotion): StaticPromotion {
  const translations = normalizeTranslationsFromApi<{ imageFileUrl?: string | null }>(
    promotion.translations,
  );

  return {
    ...promotion,
    ...(translations ? { translations } : {}),
  };
}
