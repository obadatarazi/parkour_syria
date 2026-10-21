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

const REVIEW_FILTER_IDS = ["publish", "ratingStar"] as const;

type UseProductReviewsListOptions = {
  productId: number | null;
};

export function useProductReviewsList({ productId }: UseProductReviewsListOptions) {
  const t = useTranslation();

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
    (params: ProductReviewListParams & { page: number; limit: number }, signal?: AbortSignal) => {
      if (productId == null) {
        return Promise.resolve({ data: [], total: 0, page: 1, pageSize: params.limit });
      }
      return productReviewsService.list(productId, params, signal);
    },
    [productId],
  );

  const list = useServerPaginatedList({
    queryKeyPrefix: `product-reviews-${productId ?? "none"}`,
    fetchFn,
    limit: 10,
    filterIds: [...REVIEW_FILTER_IDS],
    mapFiltersToParams,
    defaultSort: "created_at:desc",
    persistPageInUrl: false,
  });

  return {
    ...list,
    filterDefinitions,
    sortDefinitions,
  };
}
