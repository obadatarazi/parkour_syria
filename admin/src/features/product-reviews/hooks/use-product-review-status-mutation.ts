import { useCallback } from "react";

import { productReviewsService } from "@/features/product-reviews/services/product-reviews.service";
import type { ProductReview } from "@/features/product-reviews/types/product-reviews.types";
import { useCrudMutation } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type ReviewStatusVariables = {
  productId: number;
  reviewId: number;
};

export type ProductReviewStatusChange = ReviewStatusVariables & {
  publish: boolean;
};

type UseProductReviewStatusMutationOptions = {
  onSuccess?: (result: ProductReviewStatusChange) => void | Promise<void>;
};

export function useProductReviewStatusMutation({
  onSuccess,
}: UseProductReviewStatusMutationOptions = {}) {
  const t = useTranslation();

  const handleSuccess = useCallback(
    async (review: ProductReview, variables: ReviewStatusVariables, publish: boolean) => {
      await onSuccess?.({
        productId: variables.productId,
        reviewId: variables.reviewId,
        publish: review.publish ?? publish,
      });
    },
    [onSuccess],
  );

  const approveMutation = useCrudMutation({
    mutationFn: ({ productId, reviewId }: ReviewStatusVariables) =>
      productReviewsService.update(productId, reviewId, { status: "APPROVE", publish: true }),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.reviewApproveSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess: (review, variables) => handleSuccess(review, variables, true),
  });

  const declineMutation = useCrudMutation({
    mutationFn: ({ productId, reviewId }: ReviewStatusVariables) =>
      productReviewsService.update(productId, reviewId, { status: "REJECT", publish: false }),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.reviewDeclineSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess: (review, variables) => handleSuccess(review, variables, false),
  });

  const approve = useCallback(
    (productId: number, reviewId: number) => approveMutation.mutate({ productId, reviewId }),
    [approveMutation],
  );

  const decline = useCallback(
    (productId: number, reviewId: number) => declineMutation.mutate({ productId, reviewId }),
    [declineMutation],
  );

  return {
    approve,
    decline,
    isUpdating: approveMutation.isPending || declineMutation.isPending,
  };
}
