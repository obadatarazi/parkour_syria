import { useState } from "react";

import { ProductReviewForm } from "@/features/product-reviews/components/ProductReviewForm";
import { useProductReviewMutations } from "@/features/product-reviews/hooks/use-product-review-mutations";
import { productReviewsService } from "@/features/product-reviews/services/product-reviews.service";
import type {
  ProductReview,
  ProductReviewCreateFormData,
  ProductReviewFormData,
} from "@/features/product-reviews/types/product-reviews.types";
import { ConfirmDialog } from "@/shared/components";
import { CrudEntityDrawer, useCrudMutation } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type ProductReviewFormDrawerProps = {
  open: boolean;
  mode: "create" | "edit";
  productId?: number;
  review?: ProductReview | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void | Promise<void>;
};

function isCreateFormData(
  data: ProductReviewFormData | ProductReviewCreateFormData,
): data is ProductReviewCreateFormData {
  return "productId" in data;
}

export function ProductReviewFormDrawer({
  open,
  mode,
  productId,
  review,
  onOpenChange,
  onSuccess,
}: ProductReviewFormDrawerProps) {
  const t = useTranslation();
  const [isDirty, setIsDirty] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const showProductPicker = mode === "create" && productId == null;

  const fixedProductMutations = useProductReviewMutations({
    productId: productId ?? 0,
    onSuccess: async () => {
      await onSuccess();
      setIsDirty(false);
      onOpenChange(false);
    },
  });

  const catalogCreateMutation = useCrudMutation({
    mutationFn: ({
      targetProductId,
      data,
    }: {
      targetProductId: number;
      data: ProductReviewFormData;
    }) => productReviewsService.create(targetProductId, data),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudCreateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
    onSuccess: async () => {
      await onSuccess();
      setIsDirty(false);
      onOpenChange(false);
    },
  });

  const isSaving = showProductPicker
    ? catalogCreateMutation.isPending
    : fixedProductMutations.isSaving;

  const requestClose = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
      return;
    }
    onOpenChange(false);
  };

  const handleSubmit = async (data: ProductReviewFormData | ProductReviewCreateFormData) => {
    if (mode === "create" && showProductPicker) {
      if (!isCreateFormData(data) || data.productId == null || !data.userName.trim()) {
        return;
      }

      const { productId: targetProductId, ...reviewData } = data;
      await catalogCreateMutation.mutate({
        targetProductId,
        data: reviewData,
      });
      return;
    }

    if (productId == null) return;

    const result = await fixedProductMutations.save(mode, data as ProductReviewFormData, review ?? undefined);
    if (result === "skipped") {
      setIsDirty(false);
      onOpenChange(false);
    }
  };

  return (
    <>
      <CrudEntityDrawer
        open={open}
        formMode={mode}
        onOpenChange={(next) => (next ? onOpenChange(next) : requestClose())}
        title={mode === "create" ? t.addProductReview : t.editProductReview}
        size="md"
        isLoading={isSaving}
      >
        <ProductReviewForm
          mode={mode}
          review={review}
          showProductPicker={showProductPicker}
          isLoading={isSaving}
          onCancel={requestClose}
          onDirtyChange={setIsDirty}
          onSubmit={handleSubmit}
        />
      </CrudEntityDrawer>

      <ConfirmDialog
        open={showDiscardConfirm}
        onOpenChange={setShowDiscardConfirm}
        title={t.discardChangesTitle}
        description={t.discardChangesDescription}
        confirmLabel={t.discardChangesConfirm}
        cancelLabel={t.cancel}
        variant="destructive"
        onConfirm={() => {
          setShowDiscardConfirm(false);
          setIsDirty(false);
          onOpenChange(false);
        }}
      />
    </>
  );
}
