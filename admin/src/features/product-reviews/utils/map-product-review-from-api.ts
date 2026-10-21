import type {
  ProductReview,
  ProductReviewStatus,
  ProductReviewStatusValue,
} from "@/features/product-reviews/types/product-reviews.types";
import { mapTranslatableFromApi } from "@/shared/lib/api";

function isStatusValue(value: unknown): value is ProductReviewStatusValue {
  return value === "PENDING" || value === "APPROVE" || value === "REJECT";
}

function resolveStatus(
  status: ProductReview["status"],
): ProductReviewStatus | null {
  if (!status) return null;
  if (typeof status === "string" && isStatusValue(status)) {
    return { label: status, value: status };
  }
  if (typeof status === "object" && isStatusValue(status.value)) {
    return { label: status.label || status.value, value: status.value };
  }
  return null;
}

export function mapProductReviewFromApi(review: ProductReview): ProductReview {
  const status = resolveStatus(review.status);
  const publish =
    review.publish ??
    (status ? status.value === "APPROVE" : undefined);

  return {
    ...review,
    product: review.product ? mapTranslatableFromApi(review.product) : review.product,
    status: status ?? review.status,
    publish,
  };
}
