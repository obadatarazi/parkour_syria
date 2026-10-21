import { useState } from "react";

import {
  parseProductPickerFilterId,
  PRODUCT_PICKER_ALL_FILTER,
} from "@/features/products/constants/product-picker.constants";

export function useProductPickerCatalogFilters() {
  const [brandFilter, setBrandFilter] = useState(PRODUCT_PICKER_ALL_FILTER);
  const [categoryFilter, setCategoryFilter] = useState(PRODUCT_PICKER_ALL_FILTER);

  return {
    brandId: parseProductPickerFilterId(brandFilter),
    categoryId: parseProductPickerFilterId(categoryFilter),
    brandFilter,
    categoryFilter,
    setBrandFilter,
    setCategoryFilter,
    resetFilters: () => {
      setBrandFilter(PRODUCT_PICKER_ALL_FILTER);
      setCategoryFilter(PRODUCT_PICKER_ALL_FILTER);
    },
  };
}
