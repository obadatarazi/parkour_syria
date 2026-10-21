import { useEffect, useMemo, useState } from "react";

import {
  getMissingRelationPickerIds,
  resolveRelationPickerItems,
  useRelationPickerKnownItems,
} from "@/features/products/hooks/relation-picker.utils";
import type { RelationPickerSeed } from "@/features/products/types/products.types";
import { tagsService } from "@/features/tags/services/tags.service";
import type { Tag } from "@/features/tags/types/tags.types";
import { useCrudQuery } from "@/shared/crud";
import {
  formatBilingualLabel,
  getBilingualTitle,
} from "@/shared/lib/translation-display.utils";

const TAG_PICKER_PAGE_SIZE = 10;

type UseTagMultiPickerOptions = {
  selectedIds: number[];
  seedItems?: RelationPickerSeed[];
  pickedItems?: RelationPickerSeed[];
  enabled?: boolean;
  isOpen?: boolean;
};

export function getTagMultiLabel(tag: Tag): string {
  return formatBilingualLabel(getBilingualTitle(tag.translations, tag.title));
}

export function useTagMultiPicker({
  selectedIds,
  seedItems = [],
  pickedItems = [],
  enabled = true,
  isOpen = false,
}: UseTagMultiPickerOptions) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const listQuery = useCrudQuery({
    queryKey: ["tags", "multi-picker", search, String(page)],
    queryFn: (signal) =>
      tagsService.list(
        {
          page,
          limit: TAG_PICKER_PAGE_SIZE,
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

  const selectedTagsQuery = useCrudQuery({
    queryKey: ["tags", "multi-picker", "selected", missingIds.join(",")],
    queryFn: (signal) => Promise.all(missingIds.map((id) => tagsService.getById(id, signal))),
    enabled: enabled && missingIds.length > 0,
  });

  const fetchedItems = selectedTagsQuery.data ?? [];
  const resolvedKnownItems = useRelationPickerKnownItems(
    seedItems,
    pickedItems,
    [...pageItems, ...fetchedItems],
  );
  const selectedTags = useMemo(
    () => resolveRelationPickerItems<Tag>(selectedIds, resolvedKnownItems),
    [resolvedKnownItems, selectedIds],
  );

  useEffect(() => {
    setPage(1);
  }, [search]);

  const totalPages = useMemo(() => {
    const total = listQuery.data?.total ?? 0;
    const pageSize = listQuery.data?.pageSize ?? TAG_PICKER_PAGE_SIZE;
    return Math.max(1, Math.ceil(total / pageSize));
  }, [listQuery.data]);

  return {
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    pageTags: pageItems,
    selectedTags,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    error: listQuery.error,
    refetch: listQuery.refetch,
  };
}
