import type { ProductAttributeItem } from "@/features/products/utils/variant-attribute.utils";
import {
  extractAttributeIdsFromItems,
  normalizeProductType,
  uniqueNumberIds,
} from "@/features/products/utils/variant-attribute.utils";
import type { ProductTranslationsInput } from "@/shared/lib/api/form-data.utils";
import {
  areNumberArraysEqual,
  hasFormChanges,
  normalizedStringEqual,
  pickChangedScalar,
} from "@/shared/lib/form/pick-changed-fields";
import type { PaginatedResult } from "@/shared/types";

export type ProductType = "SIMPLE" | "VARIABLE_PRODUCT";

export type ProductStockStatusValue = "OUT_OF_STOCK" | "LOW_STOCK" | "IN_STOCK";

export type ProductStockStatus = {
  label: string;
  value: ProductStockStatusValue;
};

export type ProductPriceRange = {
  min: number;
  max: number;
};

export type ProductStockRange = {
  min: number;
  max: number;
};

export type ProductRelationItem = {
  id: number;
  title: string;
  translations?: Partial<Record<"en" | "ar", { title?: string }>>;
};

/** Minimal entity shape for relation pickers — avoids getById when product already includes relations. */
export type RelationPickerSeed = ProductRelationItem;

export type ProductBrand = {
  id: number;
  title: string;
  logoFileUrl?: string | null;
};

export type ProductImage = {
  id: number;
  imageFileUrl?: string | null;
  featured: boolean;
};

export type ProductVariant = {
  id: number;
  productId?: number;
  price: number;
  stock: number;
  skuCode: string;
  eanCode: string;
  hasDiscountPrice: boolean;
  priceDiscount?: number | null;
  /** Stored as typed (e.g. "20%"). Sale money amount stays in `priceDiscount`. */
  priceDiscountPercentage?: string | null;
  discountStartAt?: string | null;
  discountExpireAt?: string | null;
  attributes: ProductAttributeItem[];
  attributeValues: ProductAttributeItem[];
  images: ProductImage[];
  createdAt?: string;
  updatedAt?: string;
};

export type ProductReviewSummary = {
  id: number;
  userId?: {
    id: number;
    fullName: string;
    avatarFileUrl?: string | null;
  } | null;
  ratingStar: number;
  comment?: string | null;
};

export type Product = {
  id: number;
  brand: ProductBrand;
  categories: ProductRelationItem[];
  tags: ProductRelationItem[];
  attributes: ProductAttributeItem[];
  attributeValues: ProductAttributeItem[];
  type: ProductType;
  publish: boolean;
  approveAddToCarePlan: boolean;
  hasDiscountPrice: boolean;
  bestSeller: boolean;
  newlyArrived: boolean;
  featured: boolean;
  isProductYouWillLove: boolean;
  title: string;
  metaTitle?: string | null;
  description?: string | null;
  metaDescription?: string | null;
  slug?: string | null;
  benefits?: string | null;
  ingredients?: string | null;
  usageMethod?: string | null;
  warnings?: string | null;
  countryOfOrigin?: string | null;
  videoFileUrl?: string | null;
  /** Product-level SEO / social share image (not a gallery image). */
  metaFeatureImageFileUrl?: string | null;
  skuCode?: string | null;
  eanCode?: string | null;
  price?: number | null;
  priceDiscount?: number | null;
  priceDiscountPercentage?: string | null;
  discountStartAt?: string | null;
  discountExpireAt?: string | null;
  stock?: number | null;
  status?: ProductStockStatus | null;
  priceRange?: ProductPriceRange | null;
  /** Min/max variant stock — present for VARIABLE_PRODUCT list/details. */
  stockRange?: ProductStockRange | null;
  expiryStartDate?: string | null;
  expiryEndDate?: string | null;
  /** Slim list may send this instead of images[]. */
  featuredImageUrl?: string | null;
  images: ProductImage[];
  variants: ProductVariant[];
  averageRating?: number | null;
  /** List/details summary count — replaces full reviews[] on list. */
  reviewsCount?: number | null;
  reviews?: ProductReviewSummary[];
  translations?: ProductTranslationsInput;
  createdAt?: string;
  updatedAt?: string;
  /** Soft-deleted products only — present on trash list / order history payloads. */
  isDeleted?: boolean;
  deletedAt?: string | null;
};

export type ProductListParams = {
  page?: number;
  limit?: number;
  search?: string;
  publish?: boolean;
  brandId?: number;
  type?: ProductType;
  categoryId?: number;
  tagId?: number;
  featured?: boolean;
  bestSeller?: boolean;
  newlyArrived?: boolean;
  isProductYouWillLove?: boolean;
  skuCode?: string;
  eanCode?: string;
  attributeId?: number;
  attributeValueId?: number;
  approveAddToCarePlan?: boolean;
  sort?: string;
  direction?: "asc" | "desc";
};

export type ProductImageFormItem = {
  clientId?: string;
  id?: number;
  file: File | null;
  previewUrl?: string | null;
  featured: boolean;
};

export type ProductVariantFormItem = {
  id?: number;
  price: number;
  stock: number;
  skuCode: string;
  eanCode: string;
  hasDiscountPrice: boolean;
  priceDiscount: number | null;
  priceDiscountPercentage: string;
  discountStartAt: string;
  discountExpireAt: string;
  attributeIds: number[];
  attributeValueIds: number[];
  images: ProductImageFormItem[];
  deletedImageIds: number[];
};

export type ProductFormData = {
  brandId: number | null;
  categoryIds: number[];
  tagIds: number[];
  type: ProductType;
  translations: ProductTranslationsInput;
  publish: boolean;
  approveAddToCarePlan: boolean;
  hasDiscountPrice: boolean;
  bestSeller: boolean;
  newlyArrived: boolean;
  featured: boolean;
  isProductYouWillLove: boolean;
  skuCode: string;
  eanCode: string;
  price: number;
  priceDiscount: number | null;
  priceDiscountPercentage: string;
  discountStartAt: string;
  discountExpireAt: string;
  stock: number;
  attributeIds: number[];
  attributeValueIds: number[];
  expiryStartDate: string;
  expiryEndDate: string;
  video: File | null;
  metaFeatureImage: File | null;
  images: ProductImageFormItem[];
  deletedImageIds: number[];
  variants: ProductVariantFormItem[];
  deletedVariantIds: number[];
};

/** API `Y-m-d H:i:s` → `datetime-local` value. */
export function toDatetimeLocalValue(value?: string | null): string {
  if (!value?.trim()) return "";
  return value.trim().replace(" ", "T").slice(0, 16);
}

/** `datetime-local` → API `Y-m-d H:i:s` (empty clears). */
export function fromDatetimeLocalValue(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const normalized = trimmed.includes("T") ? trimmed.replace("T", " ") : trimmed;
  return normalized.length === 16 ? `${normalized}:00` : normalized;
}

export type ProductListResult = PaginatedResult<Product>;

export function getProductBilingualSlugs(product: Pick<Product, "translations" | "slug">): {
  en: string;
  ar: string;
} {
  return {
    en: product.translations?.en?.slug?.trim() || product.slug?.trim() || "",
    ar: product.translations?.ar?.slug?.trim() || "",
  };
}

export function createEmptyProductImageItem(featured = false): ProductImageFormItem {
  return {
    clientId: crypto.randomUUID(),
    file: null,
    previewUrl: null,
    featured,
  };
}

export function createEmptyProductVariantFormItem(): ProductVariantFormItem {
  return {
    price: 0,
    stock: 0,
    skuCode: "",
    eanCode: "",
    hasDiscountPrice: false,
    priceDiscount: null,
    priceDiscountPercentage: "",
    discountStartAt: "",
    discountExpireAt: "",
    attributeIds: [],
    attributeValueIds: [],
    images: [createEmptyProductImageItem(true)],
    deletedImageIds: [],
  };
}

export function createEmptyProductForm(): ProductFormData {
  return {
    brandId: null,
    categoryIds: [],
    tagIds: [],
    type: "SIMPLE",
    translations: {
      en: {
        title: "",
        description: "",
        metaTitle: "",
        metaDescription: "",
        benefits: "",
        ingredients: "",
        usageMethod: "",
        warnings: "",
        countryOfOrigin: "",
      },
      ar: {
        title: "",
        description: "",
        metaTitle: "",
        metaDescription: "",
        benefits: "",
        ingredients: "",
        usageMethod: "",
        warnings: "",
        countryOfOrigin: "",
      },
    },
    publish: true,
    approveAddToCarePlan: false,
    hasDiscountPrice: false,
    bestSeller: false,
    newlyArrived: false,
    featured: false,
    isProductYouWillLove: false,
    skuCode: "",
    eanCode: "",
    price: 0,
    priceDiscount: null,
    priceDiscountPercentage: "",
    discountStartAt: "",
    discountExpireAt: "",
    stock: 0,
    attributeIds: [],
    attributeValueIds: [],
    expiryStartDate: "",
    expiryEndDate: "",
    video: null,
    metaFeatureImage: null,
    images: [createEmptyProductImageItem(true)],
    deletedImageIds: [],
    variants: [createEmptyProductVariantFormItem()],
    deletedVariantIds: [],
  };
}

function productImageToFormItem(image: ProductImage): ProductImageFormItem {
  return {
    clientId: `saved-${image.id}`,
    id: image.id,
    file: null,
    previewUrl: image.imageFileUrl ?? null,
    featured: image.featured,
  };
}

function productVariantToFormItem(variant: ProductVariant): ProductVariantFormItem {
  const attributeValues = variant.attributeValues ?? [];
  const attributes = variant.attributes ?? [];
  const priceDiscount = variant.priceDiscount ?? null;
  const priceDiscountPercentage = variant.priceDiscountPercentage?.trim() ?? "";
  const hasDiscountPrice =
    Boolean(variant.hasDiscountPrice) ||
    (priceDiscount != null && Number(priceDiscount) > 0) ||
    Boolean(priceDiscountPercentage);

  return {
    id: variant.id,
    price: variant.price,
    stock: variant.stock,
    skuCode: variant.skuCode ?? "",
    eanCode: variant.eanCode ?? "",
    hasDiscountPrice,
    priceDiscount,
    priceDiscountPercentage,
    discountStartAt: toDatetimeLocalValue(variant.discountStartAt),
    discountExpireAt: toDatetimeLocalValue(variant.discountExpireAt),
    attributeIds: uniqueNumberIds(extractAttributeIdsFromItems(attributes, attributeValues)),
    attributeValueIds: uniqueNumberIds(attributeValues.map((attributeValue) => attributeValue.id)),
    images: variant.images.length
      ? variant.images.map(productImageToFormItem)
      : [createEmptyProductImageItem(true)],
    deletedImageIds: [],
  };
}

/** Derive the WooCommerce-style attribute pool from existing variant rows (edit load). */
export function deriveVariantProductAttributePool(
  variants: ProductVariant[],
): Pick<ProductFormData, "attributeIds" | "attributeValueIds"> {
  const attributeIds = new Set<number>();
  const attributeValueIds = new Set<number>();

  for (const variant of variants) {
    for (const attribute of variant.attributes ?? []) {
      attributeIds.add(attribute.id);
    }
    for (const attributeValue of variant.attributeValues ?? []) {
      attributeValueIds.add(attributeValue.id);
      if (attributeValue.attribute?.id) {
        attributeIds.add(attributeValue.attribute.id);
      }
    }
  }

  return {
    attributeIds: [...attributeIds],
    attributeValueIds: [...attributeValueIds],
  };
}

/** Keep variant attribute picks inside the configured product attribute pool. */
export function sanitizeVariantsAgainstAttributePool(
  variants: ProductVariantFormItem[],
  poolAttributeIds: number[],
  poolAttributeValueIds: number[],
): ProductVariantFormItem[] {
  const poolAttributeIdSet = new Set(poolAttributeIds);
  const poolValueIdSet = new Set(poolAttributeValueIds);

  return variants.map((variant) => ({
    ...variant,
    attributeIds: variant.attributeIds.filter((id) => poolAttributeIdSet.has(id)),
    attributeValueIds: variant.attributeValueIds.filter((id) => poolValueIdSet.has(id)),
  }));
}

function deriveProductAttributePool(
  product: Product,
  type: ProductType,
): Pick<ProductFormData, "attributeIds" | "attributeValueIds"> {
  const attributeValues = product.attributeValues ?? [];
  const attributeValueIds = attributeValues.map((attributeValue) => attributeValue.id);
  const attributeIds = extractAttributeIdsFromItems(product.attributes ?? [], attributeValues);

  if (type === "VARIABLE_PRODUCT" && attributeIds.length === 0 && attributeValueIds.length === 0) {
    return deriveVariantProductAttributePool(product.variants);
  }

  return { attributeIds, attributeValueIds };
}

export function productToFormData(product: Product): ProductFormData {
  const type = normalizeProductType(product.type);
  const variants = product.variants.length
    ? product.variants.map(productVariantToFormItem)
    : [createEmptyProductVariantFormItem()];

  const variantPool = deriveProductAttributePool(product, type);

  return {
    brandId: product.brand.id,
    categoryIds: product.categories.map((category) => category.id),
    tagIds: product.tags.map((tag) => tag.id),
    type: normalizeProductType(product.type),
    translations: {
      en: {
        title: product.translations?.en?.title ?? product.title,
        slug: product.translations?.en?.slug ?? product.slug ?? "",
        description: product.translations?.en?.description ?? product.description ?? "",
        metaTitle: product.translations?.en?.metaTitle ?? product.metaTitle ?? "",
        metaDescription:
          product.translations?.en?.metaDescription ?? product.metaDescription ?? "",
        benefits: product.translations?.en?.benefits ?? product.benefits ?? "",
        ingredients: product.translations?.en?.ingredients ?? product.ingredients ?? "",
        usageMethod: product.translations?.en?.usageMethod ?? product.usageMethod ?? "",
        warnings: product.translations?.en?.warnings ?? product.warnings ?? "",
        countryOfOrigin:
          product.translations?.en?.countryOfOrigin ?? product.countryOfOrigin ?? "",
      },
      ar: {
        title: product.translations?.ar?.title ?? "",
        slug: product.translations?.ar?.slug ?? "",
        description: product.translations?.ar?.description ?? "",
        metaTitle: product.translations?.ar?.metaTitle ?? "",
        metaDescription: product.translations?.ar?.metaDescription ?? "",
        benefits: product.translations?.ar?.benefits ?? "",
        ingredients: product.translations?.ar?.ingredients ?? "",
        usageMethod: product.translations?.ar?.usageMethod ?? "",
        warnings: product.translations?.ar?.warnings ?? "",
        countryOfOrigin: product.translations?.ar?.countryOfOrigin ?? "",
      },
    },
    publish: product.publish,
    approveAddToCarePlan: product.approveAddToCarePlan,
    hasDiscountPrice:
      Boolean(product.hasDiscountPrice) ||
      (product.priceDiscount != null && Number(product.priceDiscount) > 0) ||
      Boolean(product.priceDiscountPercentage?.trim()),
    bestSeller: product.bestSeller,
    newlyArrived: product.newlyArrived,
    featured: product.featured,
    isProductYouWillLove: product.isProductYouWillLove ?? false,
    skuCode: product.skuCode ?? "",
    eanCode: product.eanCode ?? "",
    price: product.price ?? 0,
    priceDiscount: product.priceDiscount ?? null,
    priceDiscountPercentage: product.priceDiscountPercentage?.trim() ?? "",
    discountStartAt: toDatetimeLocalValue(product.discountStartAt),
    discountExpireAt: toDatetimeLocalValue(product.discountExpireAt),
    stock: product.stock ?? 0,
    attributeIds: variantPool.attributeIds,
    attributeValueIds: variantPool.attributeValueIds,
    expiryStartDate: product.expiryStartDate ?? "",
    expiryEndDate: product.expiryEndDate ?? "",
    video: null,
    metaFeatureImage: null,
    images: product.images.length
      ? product.images.map(productImageToFormItem)
      : [createEmptyProductImageItem(true)],
    deletedImageIds: [],
    variants,
    deletedVariantIds: [],
  };
}

function pickChangedProductTranslations(
  original: ProductTranslationsInput,
  current: ProductTranslationsInput,
): ProductTranslationsInput | undefined {
  const locales = new Set([...Object.keys(original), ...Object.keys(current)]) as Set<"en" | "ar">;
  const changed: ProductTranslationsInput = {};
  let hasChanges = false;

  const fields = [
    "title",
    "slug",
    "description",
    "metaTitle",
    "metaDescription",
    "benefits",
    "ingredients",
    "usageMethod",
    "warnings",
    "countryOfOrigin",
  ] as const;

  for (const locale of locales) {
    const originalTranslation = original[locale];
    const currentTranslation = current[locale];
    const localeChanges: NonNullable<ProductTranslationsInput["en"]> = {};
    let localeHasChanges = false;

    for (const field of fields) {
      if (
        !normalizedStringEqual(originalTranslation?.[field], currentTranslation?.[field])
      ) {
        localeChanges[field] = currentTranslation?.[field]?.trim() ?? "";
        localeHasChanges = true;
      }
    }

    if (!localeHasChanges) continue;

    // Always include title with locale patches so the API never receives
    // orphan fields (e.g. description-only) for a locale without a title.
    if (!("title" in localeChanges)) {
      localeChanges.title = currentTranslation?.title?.trim() ?? "";
    }

    hasChanges = true;
    changed[locale] = localeChanges;
  }

  return hasChanges ? changed : undefined;
}

function pickChangedProductImages(
  original: ProductImageFormItem[],
  current: ProductImageFormItem[],
): ProductImageFormItem[] | undefined {
  const changed: ProductImageFormItem[] = [];
  const originalById = new Map(
    original
      .filter((image) => image.id != null)
      .map((image) => [image.id as number, image]),
  );

  for (const image of current) {
    if (image.file instanceof File) {
      changed.push(image);
      continue;
    }

    if (!image.id) {
      continue;
    }

    const originalImage = originalById.get(image.id);
    if (!originalImage) {
      continue;
    }

    if (originalImage.featured !== image.featured) {
      changed.push(image);
    }
  }

  const originalIds = new Set(original.map((image) => image.id).filter(Boolean) as number[]);
  const currentIds = new Set(current.map((image) => image.id).filter(Boolean) as number[]);
  const removedIds = [...originalIds].filter((id) => !currentIds.has(id));

  if (changed.length === 0 && removedIds.length === 0) {
    return undefined;
  }

  return changed.length > 0 ? changed : undefined;
}

function isProductVariantFormItemChanged(
  original: ProductVariantFormItem,
  current: ProductVariantFormItem,
): boolean {
  if (
    Number(original.price) !== Number(current.price) ||
    Number(original.stock) !== Number(current.stock) ||
    original.skuCode !== current.skuCode ||
    original.eanCode !== current.eanCode ||
    original.hasDiscountPrice !== current.hasDiscountPrice ||
    Number(original.priceDiscount ?? 0) !== Number(current.priceDiscount ?? 0) ||
    (original.priceDiscount == null) !== (current.priceDiscount == null) ||
    !normalizedStringEqual(original.priceDiscountPercentage, current.priceDiscountPercentage) ||
    original.discountStartAt !== current.discountStartAt ||
    original.discountExpireAt !== current.discountExpireAt
  ) {
    return true;
  }

  if (
    !areNumberArraysEqual(
      uniqueNumberIds(original.attributeIds),
      uniqueNumberIds(current.attributeIds),
    ) ||
    !areNumberArraysEqual(
      uniqueNumberIds(original.attributeValueIds),
      uniqueNumberIds(current.attributeValueIds),
    )
  ) {
    return true;
  }

  if (pickChangedProductImages(original.images, current.images)) {
    return true;
  }

  if (!areNumberArraysEqual(original.deletedImageIds, current.deletedImageIds)) {
    return true;
  }

  return false;
}

function pickChangedProductVariantItem(
  original: ProductVariantFormItem | undefined,
  current: ProductVariantFormItem,
): Partial<ProductVariantFormItem> | undefined {
  if (!original) {
    return {
      ...current,
      attributeIds: uniqueNumberIds(current.attributeIds),
      attributeValueIds: uniqueNumberIds(current.attributeValueIds),
    };
  }

  if (!isProductVariantFormItemChanged(original, current)) {
    return undefined;
  }

  const changed: Partial<ProductVariantFormItem> = {};
  if (current.id != null) {
    changed.id = current.id;
  }

  if (Number(original.price) !== Number(current.price)) {
    changed.price = current.price;
  }
  if (Number(original.stock) !== Number(current.stock)) {
    changed.stock = current.stock;
  }
  if (original.skuCode !== current.skuCode) {
    changed.skuCode = current.skuCode;
  }
  if (original.eanCode !== current.eanCode) {
    changed.eanCode = current.eanCode;
  }
  if (original.hasDiscountPrice !== current.hasDiscountPrice) {
    changed.hasDiscountPrice = current.hasDiscountPrice;
  }
  if (
    Number(original.priceDiscount ?? 0) !== Number(current.priceDiscount ?? 0) ||
    (original.priceDiscount == null) !== (current.priceDiscount == null)
  ) {
    changed.priceDiscount = current.priceDiscount;
  }
  if (!normalizedStringEqual(original.priceDiscountPercentage, current.priceDiscountPercentage)) {
    changed.priceDiscountPercentage = current.priceDiscountPercentage;
  }
  if (original.discountStartAt !== current.discountStartAt) {
    changed.discountStartAt = current.discountStartAt;
  }
  if (original.discountExpireAt !== current.discountExpireAt) {
    changed.discountExpireAt = current.discountExpireAt;
  }

  if (
    !areNumberArraysEqual(
      uniqueNumberIds(original.attributeIds),
      uniqueNumberIds(current.attributeIds),
    )
  ) {
    changed.attributeIds = uniqueNumberIds(current.attributeIds);
  }
  if (
    !areNumberArraysEqual(
      uniqueNumberIds(original.attributeValueIds),
      uniqueNumberIds(current.attributeValueIds),
    )
  ) {
    changed.attributeValueIds = uniqueNumberIds(current.attributeValueIds);
  }

  const imageChanges = pickChangedProductImages(original.images, current.images);
  if (imageChanges) {
    changed.images = imageChanges;
  }

  if (!areNumberArraysEqual(original.deletedImageIds, current.deletedImageIds)) {
    changed.deletedImageIds = current.deletedImageIds;
  }

  return changed;
}

function pickChangedProductVariants(
  original: ProductVariantFormItem[],
  current: ProductVariantFormItem[],
): Array<Partial<ProductVariantFormItem>> | undefined {
  const originalById = new Map(
    original
      .filter((variant) => variant.id != null)
      .map((variant) => [variant.id as number, variant]),
  );

  const changed = current
    .map((variant) => {
      if (!variant.id) {
        return {
          ...variant,
          attributeIds: uniqueNumberIds(variant.attributeIds),
          attributeValueIds: uniqueNumberIds(variant.attributeValueIds),
        };
      }

      return pickChangedProductVariantItem(originalById.get(variant.id), variant);
    })
    .filter((variant): variant is Partial<ProductVariantFormItem> => variant != null);

  if (changed.length === 0) {
    return undefined;
  }

  return changed;
}

export function pickProductFormChanges(
  original: ProductFormData,
  current: ProductFormData,
): Partial<ProductFormData> {
  const changes: Partial<ProductFormData> = {
    ...pickChangedScalar(original, current, [
      "brandId",
      "type",
      "publish",
      "approveAddToCarePlan",
      "hasDiscountPrice",
      "bestSeller",
      "newlyArrived",
      "featured",
      "isProductYouWillLove",
      "expiryStartDate",
      "expiryEndDate",
    ]),
  };

  if (current.type === "SIMPLE") {
    Object.assign(
      changes,
      pickChangedScalar(original, current, [
        "skuCode",
        "eanCode",
        "price",
        "stock",
        "priceDiscount",
        "priceDiscountPercentage",
        "discountStartAt",
        "discountExpireAt",
      ]),
    );
  }

  if (!areNumberArraysEqual(original.categoryIds, current.categoryIds)) {
    changes.categoryIds = current.categoryIds;
  }

  if (!areNumberArraysEqual(original.tagIds, current.tagIds)) {
    changes.tagIds = current.tagIds;
  }

  // Product-level attribute bindings apply to SIMPLE products only.
  if (
    current.type === "SIMPLE" &&
    (!areNumberArraysEqual(original.attributeIds, current.attributeIds) ||
      !areNumberArraysEqual(original.attributeValueIds, current.attributeValueIds))
  ) {
    changes.type = current.type;
    changes.attributeIds = current.attributeIds;
    changes.attributeValueIds = current.attributeValueIds;
  }

  const translationChanges = pickChangedProductTranslations(
    original.translations,
    current.translations,
  );
  if (translationChanges) {
    changes.translations = translationChanges;
  }

  const imageChanges = pickChangedProductImages(original.images, current.images);
  if (imageChanges) {
    changes.images = imageChanges;
  }

  if (!areNumberArraysEqual(original.deletedImageIds, current.deletedImageIds)) {
    changes.deletedImageIds = current.deletedImageIds;
  }

  const variantChanges = pickChangedProductVariants(original.variants, current.variants);
  if (variantChanges) {
    // Include `type` so buildProductFormData appends variants on partial updates.
    changes.type = current.type;
    changes.variants = variantChanges as ProductVariantFormItem[];
  }

  if (!areNumberArraysEqual(original.deletedVariantIds, current.deletedVariantIds)) {
    changes.type = current.type;
    changes.deletedVariantIds = current.deletedVariantIds;
  }

  if (current.video instanceof File) {
    changes.video = current.video;
  }

  if (current.metaFeatureImage instanceof File) {
    changes.metaFeatureImage = current.metaFeatureImage;
  }

  return changes;
}

function isClearedString(original: string | undefined | null, current: string | undefined | null): boolean {
  return Boolean((original ?? "").trim()) && !(current ?? "").trim();
}

/**
 * Returns human-readable labels for fields that were non-empty and are now empty.
 * Used to confirm intentional clears before a partial update.
 */
export function collectClearedProductFieldLabels(
  original: ProductFormData,
  current: ProductFormData,
  labels: {
    skuCode: string;
    eanCode: string;
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
    productTabAttributes: string;
    tabEnglish: string;
    tabArabic: string;
  },
): string[] {
  const cleared: string[] = [];

  if (isClearedString(original.skuCode, current.skuCode)) {
    cleared.push(labels.skuCode);
  }
  if (isClearedString(original.eanCode, current.eanCode)) {
    cleared.push(labels.eanCode);
  }
  if (isClearedString(original.expiryStartDate, current.expiryStartDate)) {
    cleared.push(labels.expiryStartDate);
  }
  if (isClearedString(original.expiryEndDate, current.expiryEndDate)) {
    cleared.push(labels.expiryEndDate);
  }

  if (
    original.attributeValueIds.length > 0 &&
    current.attributeValueIds.length === 0
  ) {
    cleared.push(labels.productTabAttributes);
  }

  const translationFields = [
    { key: "title" as const, en: labels.titleEnglish, ar: labels.titleArabic },
    { key: "description" as const, en: labels.description, ar: labels.description },
    { key: "benefits" as const, en: labels.benefits, ar: labels.benefits },
    { key: "ingredients" as const, en: labels.ingredients, ar: labels.ingredients },
    { key: "usageMethod" as const, en: labels.usageMethod, ar: labels.usageMethod },
    { key: "warnings" as const, en: labels.warnings, ar: labels.warnings },
    { key: "countryOfOrigin" as const, en: labels.countryOfOrigin, ar: labels.countryOfOrigin },
  ];

  for (const field of translationFields) {
    if (isClearedString(original.translations.en?.[field.key], current.translations.en?.[field.key])) {
      cleared.push(`${field.en} (${labels.tabEnglish})`);
    }
    if (isClearedString(original.translations.ar?.[field.key], current.translations.ar?.[field.key])) {
      cleared.push(
        field.key === "title"
          ? field.ar
          : `${field.en} (${labels.tabArabic})`,
      );
    }
  }

  const originalVariantsById = new Map(
    original.variants
      .filter((variant) => variant.id != null)
      .map((variant) => [variant.id as number, variant]),
  );

  current.variants.forEach((variant, index) => {
    if (!variant.id) return;
    const originalVariant = originalVariantsById.get(variant.id);
    if (!originalVariant) return;

    const variantLabel = `#${index + 1}`;
    if (isClearedString(originalVariant.skuCode, variant.skuCode)) {
      cleared.push(`${labels.skuCode} (${variantLabel})`);
    }
    if (isClearedString(originalVariant.eanCode, variant.eanCode)) {
      cleared.push(`${labels.eanCode} (${variantLabel})`);
    }
  });

  return cleared;
}

export function hasProductFormChanges(
  original: ProductFormData,
  current: ProductFormData,
): boolean {
  return hasFormChanges(pickProductFormChanges(original, current));
}
