import { useCallback } from "react";

import { productReviewsService } from "@/features/product-reviews/services/product-reviews.service";
import type { ProductReview } from "@/features/product-reviews/types/product-reviews.types";
import { useCrudQuery } from "@/shared/crud";

const REVIEW_PREVIEW_LIMIT = 5;

type UseProductReviewsPreviewOptions = {
  productId: number | null;
  enabled?: boolean;
};

export function useProductReviewsPreview({
  productId,
  enabled = true,
}: UseProductReviewsPreviewOptions) {
  const queryFn = useCallback(async () => {
    if (productId == null) {
      return { data: [] as ProductReview[], total: 0 };
    }

    const result = await productReviewsService.list(productId, {
      limit: REVIEW_PREVIEW_LIMIT,
      sort: "created_at",
      direction: "desc",
    });

    return {
      data: result.data,
      total: result.total,
    };
  }, [productId]);

  const query = useCrudQuery({
    queryKey: ["product-reviews", "preview", String(productId ?? "none")],
    queryFn,
    enabled: enabled && productId != null,
  });

  return {
    reviews: query.data?.data ?? [],
    totalReviews: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
