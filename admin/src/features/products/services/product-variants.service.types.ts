import type {
  ProductVariant,
  ProductVariantFormItem,
} from "@/features/products/types/products.types";

export type ProductVariantsService = {
  create: (productId: number, data: ProductVariantFormItem) => Promise<ProductVariant>;
  update: (
    productId: number,
    variantId: number,
    data: Partial<ProductVariantFormItem>,
  ) => Promise<ProductVariant>;
  delete: (productId: number, variantId: number) => Promise<void>;
};
