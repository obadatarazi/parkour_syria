import { useCallback, useMemo } from "react";

import { productReviewsService } from "@/features/product-reviews/services/product-reviews.service";
import type { ProductReviewListParams } from "@/features/product-reviews/types/product-reviews.types";
import {
  type CrudFilterDefinition,
  type CrudSortDefinition,
  mapBooleanFilterValue,
  mapIntegerFilterValue,
  useServerPaginatedList,
} from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

const CATALOG_FILTER_IDS = ["publish", "ratingStar"] as const;

export function useProductReviewsCatalog(limit = 10) {
  const t = useTranslation();

  const filterDefinitions = useMemo<CrudFilterDefinition[]>(
    () => [
      {
        id: "publish",
        label: t.reviewStatus,
        allLabel: t.filterAll,
        primary: true,
        options: [
          { value: "true", label: t.reviewApproved },
          { value: "false", label: t.reviewPending },
        ],
      },
      {
        id: "ratingStar",
        label: t.ratingStar,
        allLabel: t.filterAll,
        options: [
          { value: "5", label: "5 ★" },
          { value: "4", label: "4 ★" },
          { value: "3", label: "3 ★" },
          { value: "2", label: "2 ★" },
          { value: "1", label: "1 ★" },
        ],
      },
    ],
    [t],
  );

  const sortDefinitions = useMemo<CrudSortDefinition[]>(
    () => [
      {
        id: "sort",
        label: t.sortBy,
        options: [
          { value: "created_at:desc", label: t.sortNewest },
          { value: "created_at:asc", label: t.sortOldest },
          { value: "rating_star:desc", label: t.sortRating },
          { value: "rating_star:asc", label: t.sortRatingAsc },
        ],
      },
    ],
    [t],
  );

  const mapFiltersToParams = useCallback(
    (values: Record<string, string>) =>
      ({
        publish: mapBooleanFilterValue(values.publish),
        ratingStar: mapIntegerFilterValue(values.ratingStar),
      }) satisfies Pick<ProductReviewListParams, "publish" | "ratingStar">,
    [],
  );

  const fetchFn = useCallback(
    async (params: ProductReviewListParams & { page: number; limit: number }) => {
      const result = await productReviewsService.listCatalog({
        page: params.page,
        limit: params.limit,
        search: params.search,
        publish: params.publish,
        ratingStar: params.ratingStar,
        sort: params.sort,
        direction: params.direction,
      });

      return {
        data: result.rows,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
      };
    },
    [],
  );

  const list = useServerPaginatedList({
    queryKeyPrefix: "product-reviews-catalog",
    fetchFn,
    limit,
    filterIds: [...CATALOG_FILTER_IDS],
    mapFiltersToParams,
    defaultSort: "created_at:desc",
  });

  return {
    ...list,
    filterDefinitions,
    sortDefinitions,
  };
}
