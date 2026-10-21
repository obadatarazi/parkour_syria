import { Check, Eye, Loader2, X } from "lucide-react";
import type { ReactNode } from "react";

import type { ProductReviewRow } from "@/features/product-reviews/types/product-reviews.types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/design-system/components/ui/tooltip";
import { cn } from "@/shared/design-system/components/ui/utils";

type ProductReviewQuickActionButtonProps = {
  label: string;
  disabled?: boolean;
  isLoading?: boolean;
  variant?: "default" | "destructive";
  onClick: () => void;
  children: ReactNode;
};

function ProductReviewQuickActionButton({
  label,
  disabled = false,
  isLoading = false,
  variant = "default",
  onClick,
  children,
}: ProductReviewQuickActionButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">
          <button
            type="button"
            aria-label={label}
            disabled={isDisabled}
            onClick={(event) => {
              event.stopPropagation();
              onClick();
            }}
            className={cn(
              "inline-flex size-8 shrink-0 items-center justify-center rounded-md transition-opacity",
              "hover:bg-muted/60 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "disabled:pointer-events-none disabled:opacity-40",
              variant === "destructive" ? "text-destructive" : "text-brand",
            )}
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              children
            )}
          </button>
        </span>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}

type ProductReviewQuickActionsProps = {
  review: ProductReviewRow;
  canUpdate: boolean;
  isUpdating?: boolean;
  viewLabel: string;
  approveLabel: string;
  declineLabel: string;
  onView: (review: ProductReviewRow) => void;
  onApprove: (review: ProductReviewRow) => void;
  onDecline: (review: ProductReviewRow) => void;
  className?: string;
};

function resolveReviewStatusValue(
  review: Pick<ProductReviewRow, "publish" | "status">,
): "APPROVE" | "REJECT" | "PENDING" | undefined {
  if (review.publish === true) return "APPROVE";

  const statusValue =
    typeof review.status === "string"
      ? review.status
      : review.status && typeof review.status === "object"
        ? review.status.value
        : undefined;

  if (statusValue === "APPROVE" || statusValue === "REJECT" || statusValue === "PENDING") {
    return statusValue;
  }

  return review.publish === false ? "PENDING" : undefined;
}

export function ProductReviewQuickActions({
  review,
  canUpdate,
  isUpdating = false,
  viewLabel,
  approveLabel,
  declineLabel,
  onView,
  onApprove,
  onDecline,
  className,
}: ProductReviewQuickActionsProps) {
  const statusValue = resolveReviewStatusValue(review);
  const isApproved = statusValue === "APPROVE";
  const isDeclined = statusValue === "REJECT";

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      <ProductReviewQuickActionButton
        label={viewLabel}
        onClick={() => onView(review)}
      >
        <Eye className="size-4" aria-hidden="true" />
      </ProductReviewQuickActionButton>
      {canUpdate && !isApproved ? (
        <>
          <ProductReviewQuickActionButton
            label={approveLabel}
            disabled={isUpdating}
            isLoading={isUpdating}
            onClick={() => onApprove(review)}
          >
            <Check className="size-4" aria-hidden="true" />
          </ProductReviewQuickActionButton>
          {!isDeclined ? (
            <ProductReviewQuickActionButton
              label={declineLabel}
              disabled={isUpdating}
              variant="destructive"
              onClick={() => onDecline(review)}
            >
              <X className="size-4" aria-hidden="true" />
            </ProductReviewQuickActionButton>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
