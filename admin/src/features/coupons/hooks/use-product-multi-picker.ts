import { useEffect, useMemo, useState } from "react";

import {
  getMissingRelationPickerIds,
  resolveRelationPickerItems,
  useRelationPickerKnownItems,
} from "@/features/products/hooks/relation-picker.utils";
import { productsService } from "@/features/products/services/products.service";
import type { Product, RelationPickerSeed } from "@/features/products/types/products.types";
import { useCrudQuery } from "@/shared/crud";
import {
  formatBilingualLabel,
  getBilingualTitle,
} from "@/shared/lib/translation-display.utils";

const PAGE_SIZE = 10;

type Options = {
  selectedIds: number[];
  seedItems?: RelationPickerSeed[];
  pickedItems?: RelationPickerSeed[];
  enabled?: boolean;
  isOpen?: boolean;
  brandId?: number | null;
  categoryId?: number | null;
};

export function getProductMultiLabel(product: Product): string {
  return formatBilingualLabel(getBilingualTitle(product.translations, product.title));
}

export function useProductMultiPicker({
  selectedIds,
  seedItems = [],
  pickedItems = [],
  enabled = true,
  isOpen = false,
  brandId = null,
  categoryId = null,
}: Options) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const listQuery = useCrudQuery({
    queryKey: [
      "products",
      "multi-picker",
      search,
      String(page),
      String(brandId ?? ""),
      String(categoryId ?? ""),
    ],
    queryFn: (signal) =>
      productsService.list(
        {
          page,
          limit: PAGE_SIZE,
          search: search.trim() || undefined,
          brandId: brandId ?? undefined,
          categoryId: categoryId ?? undefined,
          sort: "created_at",
          direction: "desc",
        },
        signal,
      ),
    enabled: enabled && isOpen,
  });

  const pageItems = listQuery.data?.data ?? [];
  const knownBeforeFetch = useRelationPickerKnownItems(seedItems, pickedItems, pageItems);
  const missingIds = getMissingRelationPickerIds(selectedIds, knownBeforeFetch);

  const selectedQuery = useCrudQuery({
    queryKey: ["products", "multi-picker", "selected", missingIds.join(",")],
    queryFn: (signal) => Promise.all(missingIds.map((id) => productsService.getById(id, signal))),
    enabled: enabled && missingIds.length > 0,
  });

  const fetchedItems = selectedQuery.data ?? [];
  const resolvedKnownItems = useRelationPickerKnownItems(seedItems, pickedItems, [
    ...pageItems,
    ...fetchedItems,
  ]);
  const selectedProducts = useMemo(
    () => resolveRelationPickerItems<Product>(selectedIds, resolvedKnownItems),
    [resolvedKnownItems, selectedIds],
  );

  useEffect(() => {
    setPage(1);
  }, [search, brandId, categoryId]);

  return {
    search,
    setSearch,
    page,
    setPage,
    totalPages: Math.max(
      1,
      Math.ceil((listQuery.data?.total ?? 0) / (listQuery.data?.pageSize ?? PAGE_SIZE)),
    ),
    pageProducts: pageItems,
    selectedProducts,
    isLoading: listQuery.isLoading || selectedQuery.isLoading,
    isError: listQuery.isError || selectedQuery.isError,
    error: listQuery.error ?? selectedQuery.error,
    refetch: listQuery.refetch,
  };
}
