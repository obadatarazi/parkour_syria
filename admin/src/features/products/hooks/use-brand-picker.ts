import { useEffect, useMemo, useState } from "react";

import type { RelationPickerSeed } from "@/features/products/types/products.types";
import {
  getMissingRelationPickerIds,
  resolveRelationPickerItems,
  useRelationPickerKnownItems,
} from "@/features/products/hooks/relation-picker.utils";
import { brandsService } from "@/features/brands/services/brands.service";
import type { Brand } from "@/features/brands/types/brands.types";
import { useCrudQuery } from "@/shared/crud";
import {
  formatBilingualLabel,
  getBilingualTitle,
} from "@/shared/lib/translation-display.utils";

const BRAND_PICKER_PAGE_SIZE = 10;

type UseBrandPickerOptions = {
  selectedId: number | null;
  seedItem?: RelationPickerSeed | null;
  pickedItem?: RelationPickerSeed | null;
  enabled?: boolean;
  isOpen?: boolean;
};

export function getBrandLabel(brand: Brand): string {
  return formatBilingualLabel(getBilingualTitle(brand.translations, brand.title));
}

export function useBrandPicker({
  selectedId,
  seedItem = null,
  pickedItem = null,
  enabled = true,
  isOpen = false,
}: UseBrandPickerOptions) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const listQuery = useCrudQuery({
    queryKey: ["brands", "picker", search, String(page)],
    queryFn: (signal) =>
      brandsService.list(
        {
          page,
          limit: BRAND_PICKER_PAGE_SIZE,
          search: search.trim() || undefined,
          sort: "created_at",
          direction: "desc",
        },
        signal,
      ),
    enabled: enabled && isOpen,
  });

  const pageItems = listQuery.data?.data ?? [];
  const knownBeforeFetch = useRelationPickerKnownItems(
    seedItem ? [seedItem] : [],
    pickedItem ? [pickedItem] : [],
    pageItems,
  );
  const missingSelectedId = getMissingRelationPickerIds(
    selectedId != null ? [selectedId] : [],
    knownBeforeFetch,
  )[0];

  const selectedBrandQuery = useCrudQuery({
    queryKey: ["brands", "picker", "selected", String(missingSelectedId ?? "")],
    queryFn: async (signal) => {
      if (missingSelectedId == null) return null;
      return brandsService.getById(missingSelectedId, signal);
    },
    enabled: enabled && missingSelectedId != null,
  });

  const fetchedItems = useMemo(
    () => (selectedBrandQuery.data ? [selectedBrandQuery.data] : []),
    [selectedBrandQuery.data],
  );
  const resolvedKnownItems = useRelationPickerKnownItems(
    seedItem ? [seedItem] : [],
    pickedItem ? [pickedItem] : [],
    [...pageItems, ...fetchedItems],
  );
  const selectedBrand = useMemo(() => {
    const resolved = resolveRelationPickerItems<Brand>(
      selectedId != null ? [selectedId] : [],
      resolvedKnownItems,
    );
    return resolved[0] ?? null;
  }, [resolvedKnownItems, selectedId]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const totalPages = useMemo(() => {
    const total = listQuery.data?.total ?? 0;
    const pageSize = listQuery.data?.pageSize ?? BRAND_PICKER_PAGE_SIZE;
    return Math.max(1, Math.ceil(total / pageSize));
  }, [listQuery.data]);

  return {
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    pageBrands: pageItems,
    selectedBrand,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    error: listQuery.error,
    refetch: listQuery.refetch,
  };
}
