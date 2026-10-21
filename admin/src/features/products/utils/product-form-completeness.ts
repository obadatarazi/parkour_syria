import type { ProductFormData } from "@/features/products/types/products.types";

export type ProductFormSectionId =
  | "general"
  | "content"
  | "media"
  | "attributes"
  | "variants"
  | "seo";

export type ProductCompletenessItem = {
  id: string;
  section: ProductFormSectionId;
  done: boolean;
};

export function getFormFeaturedImageUrl(form: ProductFormData): string | null {
  const featured = form.images.find((image) => image.featured) ?? form.images[0];
  if (!featured) return null;
  return featured.previewUrl ?? null;
}

export function getProductFormCompleteness(
  form: ProductFormData,
  mode: "create" | "edit",
): ProductCompletenessItem[] {
  const hasTitle = Boolean(
    form.translations.en?.title?.trim() || form.translations.ar?.title?.trim(),
  );
  const hasImage = form.images.some((image) => image.file instanceof File || Boolean(image.id));
  const hasSimplePricing =
    Boolean(form.skuCode.trim()) && form.price >= 0 && form.stock >= 0;
  const hasVariants =
    form.variants.length > 0 &&
    form.variants.every(
      (variant) =>
        Boolean(variant.skuCode.trim()) &&
        variant.price >= 0 &&
        variant.stock >= 0 &&
        variant.images.some((image) => image.file instanceof File || Boolean(image.id)),
    );
  const hasSeo = Boolean(
    form.translations.en?.metaTitle?.trim() ||
      form.translations.ar?.metaTitle?.trim() ||
      form.translations.en?.metaDescription?.trim() ||
      form.translations.ar?.metaDescription?.trim(),
  );

  return [
    { id: "title", section: "general", done: hasTitle },
    { id: "brand", section: "general", done: Boolean(form.brandId) },
    { id: "categories", section: "general", done: form.categoryIds.length > 0 },
    { id: "media", section: "media", done: mode === "edit" ? hasImage || form.images.length > 0 : hasImage },
    {
      id: "pricing",
      section: form.type === "VARIABLE_PRODUCT" ? "variants" : "attributes",
      done: form.type === "VARIABLE_PRODUCT" ? hasVariants : hasSimplePricing,
    },
    { id: "seo", section: "seo", done: hasSeo },
  ];
}
