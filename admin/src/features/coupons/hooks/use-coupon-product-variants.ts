import { useMemo } from "react";

import { productsService } from "@/features/products/services/products.service";
import type { Product, ProductVariant } from "@/features/products/types/products.types";
import { normalizeProductType } from "@/features/products/utils/variant-attribute.utils";
import { useCrudQuery } from "@/shared/crud";

export type CouponVariableProductGroup = {
  product: Product;
  variants: ProductVariant[];
};

export function useCouponProductVariants(productIds: number[], enabled = true) {
  const idsKey = productIds.join(",");

  const query = useCrudQuery({
    queryKey: ["products", "coupon-variants", idsKey],
    queryFn: (signal) =>
      Promise.all(productIds.map((id) => productsService.getById(id, signal))),
    enabled: enabled && productIds.length > 0,
  });

  const variableProducts = useMemo<CouponVariableProductGroup[]>(() => {
    return (query.data ?? [])
      .filter((product) => normalizeProductType(product.type) === "VARIABLE_PRODUCT")
      .map((product) => ({
        product,
        variants: product.variants ?? [],
      }))
      .filter((group) => group.variants.length > 0);
  }, [query.data]);

  const allowedVariantIds = useMemo(
    () => variableProducts.flatMap((group) => group.variants.map((variant) => variant.id)),
    [variableProducts],
  );

  return {
    variableProducts,
    allowedVariantIds,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isSuccess: query.isSuccess,
  };
}
