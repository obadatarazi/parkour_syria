import type { Product, ProductFormData } from "@/features/products/types/products.types";
import {
  createEmptyProductImageItem,
  productToFormData,
} from "@/features/products/types/products.types";

function withCopySuffix(value: string, suffix: string): string {
  const trimmed = value.trim();
  if (!trimmed) return suffix;
  if (trimmed.toLowerCase().endsWith(suffix.toLowerCase())) {
    return `${trimmed}-${Date.now().toString(36)}`;
  }
  return `${trimmed}${suffix}`;
}

function withCopyTitle(value: string | undefined): string {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return "(copy)";
  if (/\(copy\)$/i.test(trimmed)) {
    return `${trimmed} ${Date.now().toString(36)}`;
  }
  return `${trimmed} (copy)`;
}

/**
 * Builds a create payload from an existing product, suffixing fields that must
 * stay unique (title, SKU, EAN) so duplicate does not conflict with the original.
 * The copy is always unpublished so it stays off the storefront until reviewed.
 * Image files are not copied (URLs alone cannot be re-uploaded); the new product
 * is created without media so the admin can add images afterward.
 */
export function buildProductDuplicateFormData(product: Product): ProductFormData {
  const form = productToFormData(product);
  const codeSuffix = `-copy-${Date.now().toString(36)}`;

  return {
    ...form,
    publish: false,
    translations: {
      en: {
        ...form.translations.en,
        title: withCopyTitle(form.translations.en?.title),
        slug: undefined,
      },
      ar: {
        ...form.translations.ar,
        title: withCopyTitle(form.translations.ar?.title),
        slug: undefined,
      },
    },
    skuCode: form.skuCode ? withCopySuffix(form.skuCode, codeSuffix) : "",
    eanCode: form.eanCode ? withCopySuffix(form.eanCode, codeSuffix) : "",
    video: null,
    images: [createEmptyProductImageItem(true)],
    deletedImageIds: [],
    deletedVariantIds: [],
    variants: form.variants.map((variant) => ({
      ...variant,
      id: undefined,
      skuCode: variant.skuCode ? withCopySuffix(variant.skuCode, codeSuffix) : "",
      eanCode: variant.eanCode ? withCopySuffix(variant.eanCode, codeSuffix) : "",
      images: [createEmptyProductImageItem(true)],
      deletedImageIds: [],
    })),
  };
}
