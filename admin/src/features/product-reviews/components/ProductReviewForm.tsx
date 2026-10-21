import { useEffect, useState } from "react";

import { ReviewProductPicker } from "@/features/product-reviews/components/ReviewProductPicker";
import type {
  ProductReview,
  ProductReviewCreateFormData,
  ProductReviewFormData,
} from "@/features/product-reviews/types/product-reviews.types";
import {
  createEmptyProductReviewCreateForm,
  createEmptyProductReviewForm,
  getReviewCustomerLabel,
  productReviewToFormData,
} from "@/features/product-reviews/types/product-reviews.types";
import { TextField, ToggleField, UserLabelText } from "@/shared/components";
import { CrudFormFooter, CrudFormShell } from "@/shared/crud";
import { Input } from "@/shared/design-system/components/ui/input";
import { Label } from "@/shared/design-system/components/ui/label";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type ProductReviewFormProps = {
  mode: "create" | "edit";
  review?: ProductReview | null;
  showProductPicker?: boolean;
  isLoading?: boolean;
  onSubmit: (data: ProductReviewFormData | ProductReviewCreateFormData) => void | Promise<void>;
  onCancel: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
};

const RATING_OPTIONS = [1, 2, 3, 4, 5] as const;

export function ProductReviewForm({
  mode,
  review,
  showProductPicker = false,
  isLoading = false,
  onSubmit,
  onCancel,
  onDirtyChange,
}: ProductReviewFormProps) {
  const t = useTranslation();
  const [form, setForm] = useState<ProductReviewFormData | ProductReviewCreateFormData>(
    showProductPicker ? createEmptyProductReviewCreateForm() : createEmptyProductReviewForm(),
  );
  const [userNameError, setUserNameError] = useState<string | undefined>();
  const [productError, setProductError] = useState<string | undefined>();
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (mode === "create") {
      setForm(
        showProductPicker ? createEmptyProductReviewCreateForm() : createEmptyProductReviewForm(),
      );
    } else {
      setForm(review ? productReviewToFormData(review) : createEmptyProductReviewForm());
    }
    setUserNameError(undefined);
    setProductError(undefined);
    setIsDirty(false);
  }, [review, mode, showProductPicker]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const updateForm = (
    updater: (
      current: ProductReviewFormData | ProductReviewCreateFormData,
    ) => ProductReviewFormData | ProductReviewCreateFormData,
  ) => {
    setForm(updater);
    setIsDirty(true);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    let hasError = false;

    if (mode === "create" && showProductPicker) {
      const createForm = form as ProductReviewCreateFormData;
      if (createForm.productId == null) {
        setProductError(t.required);
        hasError = true;
      } else {
        setProductError(undefined);
      }
    }

    if (mode === "create" && !form.userName.trim()) {
      setUserNameError(t.required);
      hasError = true;
    } else {
      setUserNameError(undefined);
    }

    if (hasError) return;
    void onSubmit(form);
  };

  return (
    <CrudFormShell onSubmit={handleSubmit} className="space-y-4">
      {mode === "create" && showProductPicker ? (
        <ReviewProductPicker
          value={(form as ProductReviewCreateFormData).productId}
          onChange={(productId) => {
            updateForm((current) => ({ ...current, productId } as ProductReviewCreateFormData));
            if (productId != null) setProductError(undefined);
          }}
          disabled={isLoading}
          error={productError}
        />
      ) : null}

      {mode === "create" ? (
        <TextField
          label={t.reviewAuthor}
          value={form.userName}
          onChange={(event) => {
            updateForm((current) => ({ ...current, userName: event.target.value }));
            if (event.target.value.trim()) setUserNameError(undefined);
          }}
          disabled={isLoading}
          error={userNameError}
          required
          placeholder={t.reviewAuthorPlaceholder}
        />
      ) : review ? (
        <div className="space-y-1">
          <Label>{t.reviewAuthor}</Label>
          <p className="rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-sm">
            <UserLabelText value={getReviewCustomerLabel(review)} />
          </p>
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="review-rating">{t.ratingStar}</Label>
        <div className="flex flex-wrap gap-2" id="review-rating">
          {RATING_OPTIONS.map((rating) => (
            <button
              key={rating}
              type="button"
              disabled={isLoading}
              onClick={() => updateForm((current) => ({ ...current, ratingStar: rating }))}
              className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                form.ratingStar === rating
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-foreground hover:bg-muted/60"
              }`}
            >
              {rating} ★
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-comment">{t.reviewComment}</Label>
        <textarea
          id="review-comment"
          value={form.comment}
          onChange={(event) =>
            updateForm((current) => ({ ...current, comment: event.target.value }))
          }
          disabled={isLoading}
          rows={4}
          className="flex min-h-[96px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder={t.reviewCommentPlaceholder}
        />
      </div>

      <ToggleField
        label={t.publish}
        description={t.reviewPublishHint}
        checked={form.publish}
        onCheckedChange={(checked) => updateForm((current) => ({ ...current, publish: checked }))}
      />

      <Input type="hidden" value={form.ratingStar} readOnly aria-hidden="true" />

      <CrudFormFooter
        submitLabel={mode === "create" ? t.addProductReview : t.save}
        cancelLabel={t.cancel}
        onCancel={onCancel}
        isLoading={isLoading}
        loadingLabel={t.loadingMessage}
      />
    </CrudFormShell>
  );
}
