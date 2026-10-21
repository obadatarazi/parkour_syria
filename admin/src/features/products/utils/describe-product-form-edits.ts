import type { ProductFormData } from "@/features/products/types/products.types";
import { pickProductFormChanges } from "@/features/products/types/products.types";

export type ProductFormEditLabels = {
  brand: string;
  categories: string;
  tags: string;
  productType: string;
  publish: string;
  featured: string;
  bestSeller: string;
  newlyArrived: string;
  isProductYouWillLove: string;
  approveAddToCarePlan: string;
  skuCode: string;
  eanCode: string;
  price: string;
  stock: string;
  priceDiscount: string;
  expiryStartDate: string;
  expiryEndDate: string;
  titleEnglish: string;
  titleArabic: string;
  description: string;
  benefits: string;
  ingredients: string;
  usageMethod: string;
  warnings: string;
  countryOfOrigin: string;
  metaTitle: string;
  metaDescription: string;
  productTabMedia: string;
  productVideo: string;
  productTabVariants: string;
  productTabAttributes: string;
  metaFeatureImage: string;
  tabEnglish: string;
  tabArabic: string;
};

function uniqueLabels(labels: string[]): string[] {
  return [...new Set(labels)];
}

function translationFieldLabel(
  field: string,
  locale: "en" | "ar",
  labels: ProductFormEditLabels,
): string {
  const localeName = locale === "en" ? labels.tabEnglish : labels.tabArabic;
  const fieldLabel =
    field === "title"
      ? locale === "en"
        ? labels.titleEnglish
        : labels.titleArabic
      : field === "description"
        ? labels.description
        : field === "benefits"
          ? labels.benefits
          : field === "ingredients"
            ? labels.ingredients
            : field === "usageMethod"
              ? labels.usageMethod
              : field === "warnings"
                ? labels.warnings
                : field === "countryOfOrigin"
                  ? labels.countryOfOrigin
                  : field === "metaTitle"
                    ? labels.metaTitle
                    : field === "metaDescription"
                      ? labels.metaDescription
                      : field;

  if (field === "title" && locale === "ar") {
    return fieldLabel;
  }

  return `${fieldLabel} (${localeName})`;
}

/** Human-readable list of unsaved product edits for discard/reload confirms. */
export function describeProductFormEdits(
  original: ProductFormData,
  current: ProductFormData,
  labels: ProductFormEditLabels,
): string[] {
  const changes = pickProductFormChanges(original, current);
  const items: string[] = [];

  const scalarLabels: Partial<Record<keyof ProductFormData, string>> = {
    brandId: labels.brand,
    categoryIds: labels.categories,
    tagIds: labels.tags,
    type: labels.productType,
    publish: labels.publish,
    featured: labels.featured,
    bestSeller: labels.bestSeller,
    newlyArrived: labels.newlyArrived,
    isProductYouWillLove: labels.isProductYouWillLove,
    approveAddToCarePlan: labels.approveAddToCarePlan,
    skuCode: labels.skuCode,
    eanCode: labels.eanCode,
    price: labels.price,
    stock: labels.stock,
    priceDiscount: labels.priceDiscount,
    priceDiscountPercentage: labels.priceDiscount,
    discountStartAt: labels.priceDiscount,
    discountExpireAt: labels.priceDiscount,
    hasDiscountPrice: labels.priceDiscount,
    expiryStartDate: labels.expiryStartDate,
    expiryEndDate: labels.expiryEndDate,
    attributeIds: labels.productTabAttributes,
    attributeValueIds: labels.productTabAttributes,
  };

  for (const [key, label] of Object.entries(scalarLabels) as Array<
    [keyof ProductFormData, string]
  >) {
    if (changes[key] !== undefined) {
      items.push(label);
    }
  }

  if (changes.translations) {
    for (const locale of ["en", "ar"] as const) {
      const localeChanges = changes.translations[locale];
      if (!localeChanges) continue;
      for (const field of Object.keys(localeChanges)) {
        items.push(translationFieldLabel(field, locale, labels));
      }
    }
  }

  if (changes.images || changes.deletedImageIds) {
    items.push(labels.productTabMedia);
  }
  if (changes.video) {
    items.push(labels.productVideo);
  }
  if (changes.metaFeatureImage) {
    items.push(labels.metaFeatureImage);
  }
  if (changes.variants || changes.deletedVariantIds) {
    items.push(labels.productTabVariants);
  }

  return uniqueLabels(items);
}
