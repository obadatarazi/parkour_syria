import { ExternalLink, Star } from "lucide-react";

import type { ProductReviewRow } from "@/features/product-reviews/types/product-reviews.types";
import { getReviewCustomerLabel } from "@/features/product-reviews/types/product-reviews.types";
import { StatusBadge, UserLabelText } from "@/shared/components";
import { CrudDetailField, CrudViewDialog, type CrudViewDialogSection } from "@/shared/crud";
import { Button } from "@/shared/design-system/components/ui/button";
import {
  useLocalization,
  useTranslation,
} from "@/shared/design-system/localization/contexts/LocalizationContext";
import { formatDateTime } from "@/shared/lib/datetime.utils";

type ProductReviewViewDialogProps = {
  open: boolean;
  review: ProductReviewRow | null;
  canUpdate?: boolean;
  isUpdating?: boolean;
  onOpenChange: (open: boolean) => void;
  onViewProduct?: (review: ProductReviewRow) => void;
  onApprove?: (review: ProductReviewRow) => void;
  onDecline?: (review: ProductReviewRow) => void;
};

function resolveReviewStatusLabel(
  publish: boolean | undefined,
  t: ReturnType<typeof useTranslation>,
): { label: string; variant: "success" | "warning" | "neutral" } {
  if (publish === true) {
    return { label: t.reviewApproved, variant: "success" };
  }
  if (publish === false) {
    return { label: t.reviewPending, variant: "warning" };
  }
  return { label: t.reviewPending, variant: "warning" };
}

function isReviewApproved(review: Pick<ProductReviewRow, "publish" | "status">): boolean {
  if (review.publish === true) return true;

  const statusValue =
    typeof review.status === "string"
      ? review.status
      : review.status && typeof review.status === "object"
        ? review.status.value
        : undefined;

  return statusValue === "APPROVE";
}

function isReviewDeclined(review: Pick<ProductReviewRow, "publish" | "status">): boolean {
  const statusValue =
    typeof review.status === "string"
      ? review.status
      : review.status && typeof review.status === "object"
        ? review.status.value
        : undefined;

  return statusValue === "REJECT";
}

export function ProductReviewViewDialog({
  open,
  review,
  canUpdate = false,
  isUpdating = false,
  onOpenChange,
  onViewProduct,
  onApprove,
  onDecline,
}: ProductReviewViewDialogProps) {
  const t = useTranslation();
  const { language } = useLocalization();

  if (!review) return null;

  const status = resolveReviewStatusLabel(review.publish, t);
  const approved = isReviewApproved(review);
  const declined = isReviewDeclined(review);

  const sections: CrudViewDialogSection[] = [
    {
      id: "product",
      title: t.product,
      content: (
        <div className="space-y-3">
          <CrudDetailField label={t.product}>{review.productTitle}</CrudDetailField>
          {onViewProduct ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => onViewProduct(review)}
            >
              <ExternalLink className="size-4" aria-hidden="true" />
              {t.viewProduct}
            </Button>
          ) : null}
        </div>
      ),
    },
    {
      id: "review",
      title: t.reviewDetails,
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          <CrudDetailField label={t.reviewAuthor}>
            <UserLabelText value={getReviewCustomerLabel(review)} />
          </CrudDetailField>
          <CrudDetailField label={t.ratingStar}>
            <span className="inline-flex items-center gap-1 text-amber-600">
              <Star className="size-4 fill-current" aria-hidden="true" />
              {review.ratingStar} / 5
            </span>
          </CrudDetailField>
          <CrudDetailField label={t.reviewStatus}>
            <StatusBadge label={status.label} variant={status.variant} />
          </CrudDetailField>
          <CrudDetailField label={t.date}>
            {formatDateTime(review.createdAt, language)}
          </CrudDetailField>
          <CrudDetailField label={t.reviewComment}>
            {review.comment?.trim() ? (
              review.comment
            ) : (
              <span className="text-muted-foreground">{t.notSet}</span>
            )}
          </CrudDetailField>
        </div>
      ),
    },
    ...(canUpdate
      ? [
          {
            id: "actions",
            title: t.actions,
            content: (
              <div className="flex flex-wrap gap-2">
                {!approved && onApprove ? (
                  <Button
                    type="button"
                    size="sm"
                    disabled={isUpdating}
                    onClick={() => onApprove(review)}
                  >
                    {t.reviewApprove}
                  </Button>
                ) : null}
                {!declined && onDecline ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUpdating}
                    onClick={() => onDecline(review)}
                  >
                    {approved ? t.reviewUnapprove : t.reviewDecline}
                  </Button>
                ) : null}
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <CrudViewDialog
      open={open}
      entity={review}
      onOpenChange={onOpenChange}
      title={t.viewProductReview}
      cancelLabel={t.cancel}
      sections={sections}
      hero={
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge label={status.label} variant={status.variant} />
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600">
              <Star className="size-4 fill-current" aria-hidden="true" />
              {review.ratingStar}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {t.product}: <span className="font-medium text-foreground">{review.productTitle}</span>
          </p>
        </div>
      }
    />
  );
}
