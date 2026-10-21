import { Plus, Star } from "lucide-react";
import { useMemo, useState } from "react";

import { useCrudPermissions } from "@/features/auth";
import { ProductReviewFormDrawer } from "@/features/product-reviews/components/ProductReviewFormDrawer";
import { useProductReviewMutations } from "@/features/product-reviews/hooks/use-product-review-mutations";
import { useProductReviewsList } from "@/features/product-reviews/hooks/use-product-reviews-list";
import type { ProductReview } from "@/features/product-reviews/types/product-reviews.types";
import { getReviewCustomerLabel } from "@/features/product-reviews/types/product-reviews.types";
import type { Product } from "@/features/products/types/products.types";
import { AppButton, StatusBadge, UserLabelText } from "@/shared/components";
import { PERMISSIONS } from "@/shared/constants/permissions";
import {
  CrudDeleteDialog,
  CrudEntityDrawer,
  CrudListSection,
  CrudListTable,
  CrudTableActions,
  useCrudDialog,
  useCrudRowActions,
} from "@/shared/crud";
import {
  useLocalization,
  useTranslation,
} from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { formatDateTime } from "@/shared/lib/datetime.utils";
import {
  formatBilingualLabel,
  getBilingualTitle,
} from "@/shared/lib/translation-display.utils";

type ProductReviewsDrawerProps = {
  open: boolean;
  product: Product | null;
  onOpenChange: (open: boolean) => void;
};

export function ProductReviewsDrawer({ open, product, onOpenChange }: ProductReviewsDrawerProps) {
  const t = useTranslation();
  const { language } = useLocalization();
  const productId = product?.id ?? null;
  const { canCreate, canUpdate, canDelete } = useCrudPermissions(
    PERMISSIONS.MANAGE_PRODUCT_REVIEW,
  );
  const deleteDialog = useCrudDialog<ProductReview>();
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<ProductReview | null>(null);

  const {
    items: reviews,
    search,
    setSearch,
    resetSearch,
    page,
    setPage,
    setPageSize,
    total,
    pageSize,
    isLoading,
    isError,
    error,
    refetch,
    filters,
    filterDefinitions,
    sort,
    setSort,
    sortDefinitions,
  } = useProductReviewsList({ productId });

  const { deleteMutation, isDeleting } = useProductReviewMutations({
    productId: productId ?? 0,
    onSuccess: refetch,
  });

  const rowActions = useCrudRowActions<ProductReview>({
    dialog: deleteDialog,
    canUpdate,
    canDelete,
    t,
    includeView: false,
  });

  const productTitle = product
    ? formatBilingualLabel(getBilingualTitle(product.translations, product.title))
    : "";

  const columns = useMemo(
    () => [
      {
        id: "author",
        header: t.reviewAuthor,
        cell: (review: ProductReview) => (
          <span className="text-sm font-medium text-foreground">
            <UserLabelText value={getReviewCustomerLabel(review)} />
          </span>
        ),
      },
      {
        id: "rating",
        header: t.ratingStar,
        cell: (review: ProductReview) => (
          <span className="inline-flex items-center gap-1 text-sm text-amber-600">
            <Star className="size-3.5 fill-current" aria-hidden="true" />
            {review.ratingStar} ★
          </span>
        ),
      },
      {
        id: "comment",
        header: t.reviewComment,
        className: "max-w-xs",
        cell: (review: ProductReview) => (
          <span className="line-clamp-2 text-sm text-muted-foreground">
            {review.comment || "—"}
          </span>
        ),
      },
      {
        id: "status",
        header: t.status,
        cell: (review: ProductReview) => (
          <StatusBadge
            label={review.publish === true ? t.reviewApproved : t.reviewPending}
            variant={review.publish === true ? "success" : "warning"}
          />
        ),
      },
      {
        id: "date",
        header: t.date,
        cell: (review: ProductReview) => (
          <span className="text-xs text-muted-foreground">
            {formatDateTime(review.createdAt, language)}
          </span>
        ),
      },
    ],
    [language, t],
  );

  const openCreateForm = () => {
    setFormMode("create");
    setEditingReview(null);
    setIsFormOpen(true);
  };

  const openEditForm = (review: ProductReview) => {
    setFormMode("edit");
    setEditingReview(review);
    setIsFormOpen(true);
  };

  if (!product) return null;

  return (
    <>
      <CrudEntityDrawer
        open={open}
        onOpenChange={onOpenChange}
        title={t.manageProductReviews}
        description={productTitle}
        size="xl"
      >
        <CrudListSection>
          <CrudListTable
            tableId="product-reviews-drawer"
            search={{ value: search, onChange: setSearch, onReset: resetSearch }}
            filters={{
              definitions: filterDefinitions,
              values: filters.values,
              onChange: filters.setFilter,
              onReset: filters.resetFilters,
              hasActiveFilters: filters.hasActiveFilters,
            }}
            sort={{ definitions: sortDefinitions, value: sort, onChange: setSort }}
            toolbarActions={
              canCreate ? (
                <AppButton size="sm" onClick={openCreateForm}>
                  <Plus className="size-4" aria-hidden="true" />
                  {t.addProductReview}
                </AppButton>
              ) : undefined
            }
            columns={columns}
            data={reviews}
            isLoading={isLoading}
            isError={isError}
            errorTitle={t.errorStateDefaultTitle}
            errorDescription={resolveServiceErrorMessage(error, t)}
            retryLabel={t.tryAgain}
            onRetry={() => void refetch()}
            emptyTitle={t.noReviews}
            emptyDescription={t.noReviewsDescription}
            rowActions={(review) => (
              <CrudTableActions
                entity={review}
                actions={rowActions.map((action) =>
                  action.id === "edit"
                    ? { ...action, onSelect: () => openEditForm(review) }
                    : action,
                )}
                ariaLabel={t.actions}
              />
            )}
            actionsHeader={t.actions}
            caption={t.productReviews}
            showingLabel={`${t.showing} ${reviews.length} ${t.of} ${total} ${t.results}`}
            pagination={{
              page,
              pageSize,
              totalItems: total,
              onPageChange: setPage,
              onPageSizeChange: setPageSize,
            pageSizeLabel: t.perPage,
            previousLabel: t.previous,
              nextLabel: t.nextPage,
          }}
          />
        </CrudListSection>
      </CrudEntityDrawer>

      <ProductReviewFormDrawer
        open={isFormOpen}
        mode={formMode}
        productId={product.id}
        review={editingReview}
        onOpenChange={setIsFormOpen}
        onSuccess={refetch}
      />

      <CrudDeleteDialog
        open={deleteDialog.mode === "delete"}
        onOpenChange={(next) => {
          if (!next) deleteDialog.close();
        }}
        entityLabel={deleteDialog.entity ? getReviewCustomerLabel(deleteDialog.entity) : undefined}
        isLoading={isDeleting}
        onConfirm={async () => {
          if (deleteDialog.entity) {
            const result = await deleteMutation.mutate(deleteDialog.entity);
            if (result.ok) deleteDialog.close();
          }
        }}
      />
    </>
  );
}
