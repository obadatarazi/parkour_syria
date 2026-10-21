import type {
  Product,
  ProductBrand,
  ProductRelationItem,
  ProductVariant,
} from "@/features/products/types/products.types";
import type { ProductAttributeItem, ProductTypeInput } from "@/features/products/utils/variant-attribute.utils";
import { normalizeProductType } from "@/features/products/utils/variant-attribute.utils";
import type { ProductTranslationsInput } from "@/shared/lib/api/form-data.utils";
import {
  getTitleFromApiTranslations,
  normalizeTranslationsFromApi,
} from "@/shared/lib/api/normalize-translations.utils";

function mapRelationItem(item: {
  id: number;
  title?: string;
  translations?: unknown;
}): ProductRelationItem {
  const translations = normalizeTranslationsFromApi<{ title?: string }>(item.translations);

  return {
    id: item.id,
    title: getTitleFromApiTranslations(item.translations, item.title ?? ""),
    ...(translations ? { translations } : {}),
  };
}

function mapAttributeItem(item: {
  id: number;
  title?: string;
  translations?: unknown;
  attribute?: {
    id: number;
    title?: string;
    translations?: unknown;
  } | null;
}): ProductAttributeItem {
  const translations = normalizeTranslationsFromApi<{ title?: string }>(item.translations);
  const attribute = item.attribute
    ? {
        id: item.attribute.id,
        title: getTitleFromApiTranslations(item.attribute.translations, item.attribute.title ?? ""),
        translations: normalizeTranslationsFromApi<{ title?: string }>(item.attribute.translations),
      }
    : null;

  return {
    id: item.id,
    title: getTitleFromApiTranslations(item.translations, item.title ?? ""),
    ...(translations ? { translations } : {}),
    ...(attribute ? { attribute } : {}),
  };
}

function mapBrand(brand: ProductBrand & { translations?: unknown }): ProductBrand {
  return {
    id: brand.id,
    title: getTitleFromApiTranslations(brand.translations, brand.title ?? ""),
    logoFileUrl: brand.logoFileUrl ?? null,
  };
}

function readTranslationField(
  translation: Record<string, unknown> | undefined,
  camelKey: string,
  snakeKey: string,
): string {
  if (!translation) return "";
  const camel = translation[camelKey];
  if (typeof camel === "string") return camel;
  const snake = translation[snakeKey];
  if (typeof snake === "string") return snake;
  return "";
}

function mapLocaleTranslation(
  translation: Record<string, unknown> | undefined,
  fallbacks?: {
    title?: string | null;
    description?: string | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
    slug?: string | null;
    benefits?: string | null;
    ingredients?: string | null;
    usageMethod?: string | null;
    warnings?: string | null;
    countryOfOrigin?: string | null;
  },
) {
  return {
    title: readTranslationField(translation, "title", "title") || fallbacks?.title || "",
    slug: readTranslationField(translation, "slug", "slug") || fallbacks?.slug || "",
    description:
      readTranslationField(translation, "description", "description") ||
      fallbacks?.description ||
      "",
    metaTitle:
      readTranslationField(translation, "metaTitle", "meta_title") ||
      fallbacks?.metaTitle ||
      "",
    metaDescription:
      readTranslationField(translation, "metaDescription", "meta_description") ||
      fallbacks?.metaDescription ||
      "",
    benefits:
      readTranslationField(translation, "benefits", "benefits") || fallbacks?.benefits || "",
    ingredients:
      readTranslationField(translation, "ingredients", "ingredients") ||
      fallbacks?.ingredients ||
      "",
    usageMethod:
      readTranslationField(translation, "usageMethod", "usage_method") ||
      fallbacks?.usageMethod ||
      "",
    warnings:
      readTranslationField(translation, "warnings", "warnings") || fallbacks?.warnings || "",
    countryOfOrigin:
      readTranslationField(translation, "countryOfOrigin", "country_of_origin") ||
      fallbacks?.countryOfOrigin ||
      "",
  };
}

function mapProductTranslations(
  translations: unknown,
  productFallbacks?: {
    title?: string | null;
    description?: string | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
    slug?: string | null;
    benefits?: string | null;
    ingredients?: string | null;
    usageMethod?: string | null;
    warnings?: string | null;
    countryOfOrigin?: string | null;
  },
): ProductTranslationsInput | undefined {
  const normalized = normalizeTranslationsFromApi<Record<string, unknown>>(translations);

  if (!normalized && !productFallbacks) return undefined;

  return {
    en: mapLocaleTranslation(normalized?.en, productFallbacks),
    ar: mapLocaleTranslation(normalized?.ar),
  };
}

export function mapProductVariantFromApi(variant: ProductVariant): ProductVariant {
  const priceDiscount = variant.priceDiscount ?? null;
  const priceDiscountPercentage = variant.priceDiscountPercentage?.trim() || null;
  const hasDiscountPrice =
    variant.hasDiscountPrice ||
    (priceDiscount != null && Number(priceDiscount) > 0) ||
    Boolean(priceDiscountPercentage);

  return {
    ...variant,
    price: variant.price ?? 0,
    stock: variant.stock ?? 0,
    skuCode: variant.skuCode ?? "",
    eanCode: variant.eanCode ?? "",
    hasDiscountPrice,
    priceDiscount,
    priceDiscountPercentage,
    discountStartAt: variant.discountStartAt ?? null,
    discountExpireAt: variant.discountExpireAt ?? null,
    attributes: (variant.attributes ?? []).map(mapAttributeItem),
    attributeValues: (variant.attributeValues ?? []).map(mapAttributeItem),
    images: variant.images ?? [],
  };
}

function normalizeStockStatus(
  status: Product["status"] | string | null | undefined,
): Product["status"] {
  if (status == null || status === "") return null;
  if (typeof status === "string") {
    return { value: status as NonNullable<Product["status"]>["value"], label: status };
  }
  return status;
}

function mapListImages(product: Product & { featuredImageUrl?: string | null }): Product["images"] {
  if (product.images?.length) return product.images;
  if (product.featuredImageUrl) {
    return [{ id: 0, imageFileUrl: product.featuredImageUrl, featured: true }];
  }
  return [];
}

/** Normalizes product payloads from admin/public API (id or slug) into admin UI shape. */
export function mapProductFromApi(product: Product & { featuredImageUrl?: string | null }): Product {
  const translations =
    mapProductTranslations(product.translations, {
      title: product.title,
      description: product.description,
      benefits: product.benefits,
      ingredients: product.ingredients,
      usageMethod: product.usageMethod,
      warnings: product.warnings,
      countryOfOrigin: product.countryOfOrigin,
    }) ?? product.translations;

  const englishSlug = translations?.en?.slug?.trim() ?? "";

  return {
    ...product,
    slug: englishSlug || null,
    type: normalizeProductType(product.type as ProductTypeInput),
    status: normalizeStockStatus(product.status),
    priceRange: product.priceRange ?? null,
    stockRange: product.stockRange ?? null,
    priceDiscount: product.priceDiscount ?? null,
    priceDiscountPercentage: product.priceDiscountPercentage?.trim() || null,
    discountStartAt: product.discountStartAt ?? null,
    discountExpireAt: product.discountExpireAt ?? null,
    metaFeatureImageFileUrl: product.metaFeatureImageFileUrl ?? null,
    metaTitle:
      (typeof product.metaTitle === "string" && product.metaTitle) ||
      translations?.en?.metaTitle ||
      translations?.ar?.metaTitle ||
      null,
    metaDescription:
      (typeof product.metaDescription === "string" && product.metaDescription) ||
      translations?.en?.metaDescription ||
      translations?.ar?.metaDescription ||
      null,
    approveAddToCarePlan: product.approveAddToCarePlan ?? false,
    hasDiscountPrice:
      product.hasDiscountPrice ||
      (product.priceDiscount != null && Number(product.priceDiscount) > 0) ||
      Boolean(product.priceDiscountPercentage?.trim()) ||
      (product.variants ?? []).some(
        (variant) =>
          variant.hasDiscountPrice ||
          (variant.priceDiscount != null && Number(variant.priceDiscount) > 0) ||
          Boolean(variant.priceDiscountPercentage?.trim()),
      ),
    bestSeller: product.bestSeller ?? false,
    newlyArrived: product.newlyArrived ?? false,
    featured: product.featured ?? false,
    isProductYouWillLove: product.isProductYouWillLove ?? false,
    publish: product.publish ?? false,
    reviewsCount: product.reviewsCount ?? product.reviews?.length ?? null,
    title: getTitleFromApiTranslations(product.translations, product.title ?? ""),
    brand: product.brand
      ? mapBrand(product.brand as ProductBrand & { translations?: unknown })
      : { id: 0, title: "" },
    categories: (product.categories ?? []).map(mapRelationItem),
    tags: (product.tags ?? []).map(mapRelationItem),
    attributes: (product.attributes ?? []).map(mapAttributeItem),
    attributeValues: (product.attributeValues ?? []).map(mapAttributeItem),
    images: mapListImages(product),
    variants: (product.variants ?? []).map(mapProductVariantFromApi),
    translations,
    isDeleted: product.isDeleted ?? Boolean(product.deletedAt),
    deletedAt: product.deletedAt ?? null,
  };
}
