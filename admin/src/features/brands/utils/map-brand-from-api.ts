import type { Brand } from "@/features/brands/types/brands.types";
import { mapTranslatableFromApi } from "@/shared/lib/api/map-translatable-from-api.utils";
import { getTitleFromApiTranslations } from "@/shared/lib/api/normalize-translations.utils";

type RawBrand = Brand & {
  /** Slim list field — details still use `logoFileUrl`. */
  imageFileUrl?: string | null;
};

export function mapBrandFromApi(brand: RawBrand): Brand {
  const mapped = mapTranslatableFromApi(brand);
  const title =
    mapped.title?.trim() ||
    getTitleFromApiTranslations(brand.translations, "") ||
    "";

  return {
    ...mapped,
    title,
    logoFileUrl: brand.logoFileUrl ?? brand.imageFileUrl ?? null,
  };
}
