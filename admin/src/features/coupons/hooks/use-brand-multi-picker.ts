import { useEffect, useMemo, useState } from "react";

import { brandsService } from "@/features/brands/services/brands.service";
import type { Brand } from "@/features/brands/types/brands.types";
import {
  getMissingRelationPickerIds,
  resolveRelationPickerItems,
  useRelationPickerKnownItems,
} from "@/features/products/hooks/relation-picker.utils";
import type { RelationPickerSeed } from "@/features/products/types/products.types";
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
};

export function getBrandMultiLabel(brand: Brand): string {
  return formatBilingualLabel(getBilingualTitle(brand.translations, brand.title));
}

export function useBrandMultiPicker({
  selectedIds,
  seedItems = [],
  pickedItems = [],
  enabled = true,
  isOpen = false,
}: Options) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const listQuery = useCrudQuery({
    queryKey: ["brands", "multi-picker", search, String(page)],
    queryFn: (signal) =>
      brandsService.list(
        {
          page,
          limit: PAGE_SIZE,
          search: search.trim() || undefined,
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
    queryKey: ["brands", "multi-picker", "selected", missingIds.join(",")],
    queryFn: (signal) => Promise.all(missingIds.map((id) => brandsService.getById(id, signal))),
    enabled: enabled && missingIds.length > 0,
  });

  const fetchedItems = selectedQuery.data ?? [];
  const resolvedKnownItems = useRelationPickerKnownItems(seedItems, pickedItems, [
    ...pageItems,
    ...fetchedItems,
  ]);
  const selectedBrands = useMemo(
    () => resolveRelationPickerItems<Brand>(selectedIds, resolvedKnownItems),
    [resolvedKnownItems, selectedIds],
  );

  useEffect(() => {
    setPage(1);
  }, [search]);

  return {
    search,
    setSearch,
    page,
    setPage,
    totalPages: Math.max(
      1,
      Math.ceil((listQuery.data?.total ?? 0) / (listQuery.data?.pageSize ?? PAGE_SIZE)),
    ),
    pageBrands: pageItems,
    selectedBrands,
    isLoading: listQuery.isLoading || selectedQuery.isLoading,
    isError: listQuery.isError || selectedQuery.isError,
    error: listQuery.error ?? selectedQuery.error,
    refetch: listQuery.refetch,
  };
}
