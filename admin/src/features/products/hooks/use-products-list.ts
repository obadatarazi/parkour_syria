import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router";

import { useBrandOptions } from "@/features/brands/hooks/use-brands-list";
import { productsService } from "@/features/products/services/products.service";
import type { ProductListParams } from "@/features/products/types/products.types";
import {
  type CrudFilterDefinition,
  type CrudSortDefinition,
  mapBooleanFilterValue,
  mapIntegerFilterValue,
  mapStringFilterValue,
  useCrudQuery,
  useServerPaginatedList,
} from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { useUrlSearchParam } from "@/shared/hooks/use-url-search-param";

const PRODUCT_FILTER_IDS = [
  "publish",
  "brandId",
  "type",
  "categoryId",
  "tagId",
  "featured",
  "bestSeller",
  "newlyArrived",
  "isProductYouWillLove",
] as const;

const TRASH_QUERY_KEY = "trash";

function parseBrandIdFilter(value: string): string | undefined {
  if (!/^\d+$/.test(value)) return undefined;
  return value;
}

function isTrashParamEnabled(value: string | null): boolean {
  return value === "1" || value === "true";
}

export function useProductsList(limit = 12) {
  const t = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = useUrlSearchParam();
  const brandIdFromUrl = useUrlSearchParam("brandId");
  const isTrash = isTrashParamEnabled(searchParams.get(TRASH_QUERY_KEY));
  const prevIsTrashRef = useRef(isTrash);
  const [initialFilterValues] = useState(() => {
    const brandId = parseBrandIdFilter(brandIdFromUrl);
    return brandId ? { brandId } : undefined;
  });
  const { options: brandOptions } = useBrandOptions();
  const brandFilterOptions = useMemo(() => {
    const selectedBrandId = initialFilterValues?.brandId;
    if (!selectedBrandId || brandOptions.some((option) => option.value === selectedBrandId)) {
      return brandOptions;
    }
    return [{ value: selectedBrandId, label: `#${selectedBrandId}` }, ...brandOptions];
  }, [brandOptions, initialFilterValues?.brandId]);

  const filterDefinitions = useMemo<CrudFilterDefinition[]>(
    () => [
      {
        id: "publish",
        label: t.status,
        allLabel: t.filterAll,
        primary: true,
        options: [
          { value: "true", label: t.active },
          { value: "false", label: t.inactive },
        ],
      },
      {
        id: "brandId",
        label: t.brand,
        allLabel: t.filterAll,
        primary: true,
        options: brandFilterOptions,
      },
      {
        id: "type",
        label: t.productType,
        allLabel: t.filterAll,
        options: [
          { value: "SIMPLE", label: t.productTypeSimple },
          { value: "VARIABLE_PRODUCT", label: t.productTypeVariant },
        ],
      },
      {
        id: "featured",
        label: t.featured,
        allLabel: t.filterAll,
        options: [
          { value: "true", label: t.active },
          { value: "false", label: t.inactive },
        ],
      },
      {
        id: "bestSeller",
        label: t.bestSeller,
        allLabel: t.filterAll,
        options: [
          { value: "true", label: t.active },
          { value: "false", label: t.inactive },
        ],
      },
      {
        id: "newlyArrived",
        label: t.newlyArrived,
        allLabel: t.filterAll,
        options: [
          { value: "true", label: t.active },
          { value: "false", label: t.inactive },
        ],
      },
      {
        id: "isProductYouWillLove",
        label: t.isProductYouWillLove,
        allLabel: t.filterAll,
        options: [
          { value: "true", label: t.active },
          { value: "false", label: t.inactive },
        ],
      },
    ],
    [brandFilterOptions, t],
  );

  const sortDefinitions = useMemo<CrudSortDefinition[]>(
    () => [
      {
        id: "sort",
        label: t.sortBy,
        options: isTrash
          ? [
              { value: "deleted_at:desc", label: t.sortDeletedNewest },
              { value: "deleted_at:asc", label: t.sortDeletedOldest },
              { value: "title:asc", label: t.sortTitleAsc },
              { value: "title:desc", label: t.sortTitleDesc },
              { value: "id:desc", label: t.sortIdDesc },
            ]
          : [
              { value: "created_at:desc", label: t.sortNewest },
              { value: "created_at:asc", label: t.sortOldest },
              { value: "title:asc", label: t.sortTitleAsc },
              { value: "title:desc", label: t.sortTitleDesc },
              { value: "id:desc", label: t.sortIdDesc },
            ],
      },
    ],
    [isTrash, t],
  );

  const mapFiltersToParams = useCallback(
    (values: Record<string, string>) =>
      ({
        publish: mapBooleanFilterValue(values.publish),
        brandId: mapIntegerFilterValue(values.brandId),
        type: mapStringFilterValue(values.type) as ProductListParams["type"] | undefined,
        categoryId: mapIntegerFilterValue(values.categoryId),
        tagId: mapIntegerFilterValue(values.tagId),
        featured: mapBooleanFilterValue(values.featured),
        bestSeller: mapBooleanFilterValue(values.bestSeller),
        newlyArrived: mapBooleanFilterValue(values.newlyArrived),
        isProductYouWillLove: mapBooleanFilterValue(values.isProductYouWillLove),
      }) satisfies Pick<
        ProductListParams,
        | "publish"
        | "brandId"
        | "type"
        | "categoryId"
        | "tagId"
        | "featured"
        | "bestSeller"
        | "newlyArrived"
        | "isProductYouWillLove"
      >,
    [],
  );

  const fetchFn = useCallback(
    (params: ProductListParams & { page: number; limit: number }, signal?: AbortSignal) =>
      isTrash
        ? productsService.listTrashed(params, signal)
        : productsService.list(params, signal),
    [isTrash],
  );

  const defaultSort = isTrash ? "deleted_at:desc" : "created_at:desc";

  const list = useServerPaginatedList({
    queryKeyPrefix: isTrash ? "products-trashed" : "products",
    exportPath: isTrash ? undefined : "/admin/products/export",
    fetchFn,
    limit,
    filterIds: [...PRODUCT_FILTER_IDS],
    mapFiltersToParams,
    defaultSort,
    initialSearch,
    initialFilterValues,
  });

  // Reset sort/page/selection only when switching All ↔ Trash (not on first paint).
  useEffect(() => {
    if (prevIsTrashRef.current === isTrash) return;
    prevIsTrashRef.current = isTrash;
    list.setSort(defaultSort);
    list.setPage(1);
    list.selection.clearSelection();
  }, [defaultSort, isTrash, list]);

  const setIsTrash = useCallback(
    (nextTrash: boolean) => {
      const next = new URLSearchParams(searchParams);
      if (nextTrash) {
        next.set(TRASH_QUERY_KEY, "1");
      } else {
        next.delete(TRASH_QUERY_KEY);
      }
      next.delete("page");
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const activeBrandId = parseBrandIdFilter(list.filters.values.brandId ?? "");

  useEffect(() => {
    const urlBrandId = parseBrandIdFilter(searchParams.get("brandId")?.trim() ?? "");
    if (urlBrandId === activeBrandId) return;

    const next = new URLSearchParams(searchParams);
    if (activeBrandId) {
      next.set("brandId", activeBrandId);
    } else {
      next.delete("brandId");
    }
    setSearchParams(next, { replace: true });
  }, [activeBrandId, searchParams, setSearchParams]);

  // Prefetch the other tab’s total so both All (n) | Trash (n) stay filled.
  const otherTabTotalQuery = useCrudQuery({
    queryKey: [isTrash ? "products-tab-count" : "products-trashed-tab-count", "1"],
    queryFn: (signal) =>
      isTrash
        ? productsService.list({ page: 1, limit: 1 }, signal)
        : productsService.listTrashed({ page: 1, limit: 1 }, signal),
    staleTime: 30_000,
  });

  const allTotal = isTrash ? (otherTabTotalQuery.data?.total ?? null) : list.total;
  const trashTotal = isTrash ? list.total : (otherTabTotalQuery.data?.total ?? null);

  return {
    ...list,
    isTrash,
    setIsTrash,
    allTotal,
    trashTotal,
    filterDefinitions,
    sortDefinitions,
  };
}
