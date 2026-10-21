import { Plus, Star } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";

import { productViewPath } from "@/app/router/routes";
import { useCrudPermissions } from "@/features/auth";
import { ProductReviewFormDrawer } from "@/features/product-reviews/components/ProductReviewFormDrawer";
import { ProductReviewQuickActions } from "@/features/product-reviews/components/ProductReviewQuickActions";
import { ProductReviewViewDialog } from "@/features/product-reviews/components/ProductReviewViewDialog";
import { useProductReviewStatusMutation } from "@/features/product-reviews/hooks/use-product-review-status-mutation";
import { useProductReviewsCatalog } from "@/features/product-reviews/hooks/use-product-reviews-catalog";
import { productReviewsService } from "@/features/product-reviews/services/product-reviews.service";
import type { ProductReviewRow } from "@/features/product-reviews/types/product-reviews.types";
import { getReviewCustomerLabel } from "@/features/product-reviews/types/product-reviews.types";
import { AppButton, StatusBadge, UserLabelText } from "@/shared/components";
import { PERMISSIONS } from "@/shared/constants/permissions";
import {
  CrudEntityNameCell,
  CrudListPage,
  CrudListSection,
  CrudListTable,
  useCrudDialog,
} from "@/shared/crud";
import {
  useLocalization,
  useTranslation,
} from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { useCrudPageGuidance } from "@/shared/guidance";
import { useOpenEntityFromUrl } from "@/shared/hooks/use-open-entity-from-url";
import { formatDateTime } from "@/shared/lib/datetime.utils";

function reviewRowKey(row: ProductReviewRow): string {
  return `${row.productId}-${row.id}`;
}

function resolveReviewStatus(
  review: Pick<ProductReviewRow, "publish" | "status">,
  t: ReturnType<typeof useTranslation>,
): { label: string; variant: "success" | "warning" | "neutral" } {
  const statusValue =
    typeof review.status === "string"
      ? review.status
      : review.status && typeof review.status === "object"
        ? review.status.value
        : undefined;

  if (statusValue === "APPROVE" || review.publish === true) {
    return { label: t.reviewApproved, variant: "success" };
  }
  if (statusValue === "REJECT") {
    return { label: t.reviewDecline, variant: "neutral" };
  }
  return { label: t.reviewPending, variant: "warning" };
}

export function ProductReviewsPage() {
  const t = useTranslation();
  const navigate = useNavigate();
  const { language } = useLocalization();
  const guidance = useCrudPageGuidance("product-reviews");
  const { canCreate, canUpdate } = useCrudPermissions(PERMISSIONS.MANAGE_PRODUCT_REVIEW);
  const reviewDialog = useCrudDialog<ProductReviewRow>();
  useOpenEntityFromUrl(reviewDialog.openView, {
    clearParams: ["productId"],
    buildEntity: (id, params) => {
      const productId = Number(params.get("productId"));
      if (!Number.isFinite(productId) || productId <= 0) return null;
      return { id, productId } as ProductReviewRow;
    },
  });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);

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
    patchItems,
    filters,
    filterDefinitions,
  } = useProductReviewsCatalog();

  const { approve, decline, isUpdating } = useProductReviewStatusMutation({
    onSuccess: async (result) => {
      patchItems((rows) =>
        rows.map((row) =>
          row.productId === result.productId && row.id === result.reviewId
            ? { ...row, publish: result.publish }
            : row,
        ),
      );

      if (reviewDialog.entity) {
        const refreshed = await productReviewsService.getById(
          reviewDialog.entity.productId,
          reviewDialog.entity.id,
        );
        reviewDialog.openView({
          ...refreshed,
          productId: reviewDialog.entity.productId,
          productTitle: reviewDialog.entity.productTitle,
        });
      }
    },
  });

  const { openView: openReviewView } = reviewDialog;
  const handleViewReview = useCallback(
    async (row: ProductReviewRow) => {
      const refreshed = await productReviewsService.getById(row.productId, row.id);
      openReviewView({
        ...refreshed,
        productId: row.productId,
        productTitle: row.productTitle ?? refreshed.productTitle,
      });
    },
    [openReviewView],
  );

  const hydratedReviewKeyRef = useRef<string | null>(null);
  useEffect(() => {
    const entity = reviewDialog.entity;
    if (reviewDialog.mode !== "view" || !entity?.id || !entity.productId) return;
    // URL deep-link stubs only carry ids — hydrate full review once.
    if (entity.ratingStar !== undefined) return;

    const key = `${entity.productId}-${entity.id}`;
    if (hydratedReviewKeyRef.current === key) return;
    hydratedReviewKeyRef.current = key;
    void handleViewReview(entity);
  }, [handleViewReview, reviewDialog.entity, reviewDialog.mode]);

  const handleViewProduct = useCallback(
    (row: ProductReviewRow) => {
      navigate(productViewPath(String(row.productId)));
    },
    [navigate],
  );

  const handleApprove = async (row: ProductReviewRow) => {
    if (updatingKey !== null || isUpdating || row.publish === true) return;
    setUpdatingKey(reviewRowKey(row));
    try {
      await approve(row.productId, row.id);
    } finally {
      setUpdatingKey(null);
    }
  };

  const handleDecline = async (row: ProductReviewRow) => {
    if (updatingKey !== null || isUpdating || row.publish === false) return;
    setUpdatingKey(reviewRowKey(row));
    try {
      await decline(row.productId, row.id);
    } finally {
      setUpdatingKey(null);
    }
  };

  const columns = useMemo(
    () => [
      {
        id: "product",
        header: t.product,
        className: "max-w-xs",
        cell: (row: ProductReviewRow) => (
          <CrudEntityNameCell
            imageUrl={row.productImageUrl}
            imageAlt={row.productTitle}
            placeholder="📦"
            onClick={() => void handleViewProduct(row)}
          >
            <span className="text-sm font-medium text-brand">{row.productTitle}</span>
          </CrudEntityNameCell>
        ),
      },
      {
        id: "customer",
        header: t.reviewAuthor,
        cell: (row: ProductReviewRow) => (
          <button
            type="button"
            className="text-sm text-foreground transition hover:text-brand hover:underline"
            onClick={() => void handleViewReview(row)}
          >
            <UserLabelText value={getReviewCustomerLabel(row)} />
          </button>
        ),
      },
      {
        id: "rating",
        header: t.ratingStar,
        cell: (row: ProductReviewRow) => (
          <span className="inline-flex items-center gap-1 text-sm text-amber-600">
            <Star className="size-3.5 fill-current" aria-hidden="true" />
            {row.ratingStar}
          </span>
        ),
      },
      {
        id: "comment",
        header: t.reviewComment,
        className: "max-w-sm",
        cell: (row: ProductReviewRow) => (
          <button
            type="button"
            className="line-clamp-2 text-start text-sm text-muted-foreground transition hover:text-foreground"
            onClick={() => void handleViewReview(row)}
          >
            {row.comment || "—"}
          </button>
        ),
      },
      {
        id: "status",
        header: t.reviewStatus,
        cell: (row: ProductReviewRow) => {
          const status = resolveReviewStatus(row, t);
          return <StatusBadge label={status.label} variant={status.variant} />;
        },
      },
      {
        id: "date",
        header: t.date,
        cell: (row: ProductReviewRow) => (
          <span className="text-xs text-muted-foreground">
            {formatDateTime(row.createdAt, language)}
          </span>
        ),
      },
    ],
    [handleViewProduct, handleViewReview, language, t],
  );

  return (
    <CrudListPage
      {...guidance.pageProps}
      title={t.productReviewsMenu}
      actions={
        canCreate ? (
          <AppButton onClick={() => setIsCreateOpen(true)}>
            <Plus className="size-4" aria-hidden="true" />
            {t.addProductReview}
          </AppButton>
        ) : undefined
      }
    >
      <CrudListSection>
        <CrudListTable
          guidanceAnchors={{
            search: guidance.searchDataGuidance,
            filters: guidance.filtersDataGuidance,
            rowActions: guidance.rowActionsDataGuidance,
          }}
          tableId="product-reviews"
          search={{
            value: search,
            onChange: setSearch,
            onReset: resetSearch,
            placeholder: t.productReviewsSearchPlaceholder,
          }}
          filters={{
            definitions: filterDefinitions,
            values: filters.values,
            onChange: filters.setFilter,
            onReset: filters.resetFilters,
            hasActiveFilters: filters.hasActiveFilters,
          }}
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
          rowActions={(row) => {
            const isRowUpdating = updatingKey === reviewRowKey(row) || isUpdating;

            return (
              <ProductReviewQuickActions
                review={row}
                canUpdate={canUpdate}
                isUpdating={isRowUpdating}
                viewLabel={t.viewAction}
                approveLabel={t.reviewApprove}
                declineLabel={t.reviewDecline}
                onView={(entity) => void handleViewReview(entity)}
                onApprove={(entity) => void handleApprove(entity)}
                onDecline={(entity) => void handleDecline(entity)}
              />
            );
          }}
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

      <ProductReviewFormDrawer
        open={isCreateOpen}
        mode="create"
        onOpenChange={setIsCreateOpen}
        onSuccess={() => void refetch()}
      />

      <ProductReviewViewDialog
        open={reviewDialog.mode === "view"}
        review={reviewDialog.entity}
        canUpdate={canUpdate}
        isUpdating={updatingKey === (reviewDialog.entity ? reviewRowKey(reviewDialog.entity) : null)}
        onOpenChange={(open) => {
          if (!open) reviewDialog.close();
        }}
        onViewProduct={handleViewProduct}
        onApprove={(row) => void handleApprove(row)}
        onDecline={(row) => void handleDecline(row)}
      />
    </CrudListPage>
  );
}
