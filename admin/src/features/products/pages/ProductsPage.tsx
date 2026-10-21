import { Banknote, Plus, RotateCcw, Star, Trash2, Upload } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

import { productEditPath, productViewPath, ROUTES } from "@/app/router/routes";
import { useCrudPermissions } from "@/features/auth";
import { ProductBulkPriceDialog } from "@/features/products/components/ProductBulkPriceDialog";
import { ProductExportDialog } from "@/features/products/components/ProductExportDialog";
import { ProductImportDialog } from "@/features/products/components/ProductImportDialog";
import { ProductQuickEditDrawer } from "@/features/products/components/ProductQuickEditDrawer";
import { ProductRowTitleCell } from "@/features/products/components/ProductRowTitleCell";
import { ProductVisibilityBadges } from "@/features/products/components/ProductVisibilityBadges";
import {
  type ProductQuickToggleField,
  useProductMutations,
} from "@/features/products/hooks/use-product-mutations";
import { useProductsList } from "@/features/products/hooks/use-products-list";
import { productsService } from "@/features/products/services/products.service";
import {
  BULK_ADJUST_PRICE_MAX_IDS,
  type ProductBulkAdjustPriceInput,
  type ProductBulkUpdateEntry,
} from "@/features/products/services/products.service.types";
import type { Product } from "@/features/products/types/products.types";
import {
  formatProductStockLabel,
  getProductPriceDisplay,
} from "@/features/products/utils/product-display.utils";
import { normalizeProductType } from "@/features/products/utils/variant-attribute.utils";
import { AppButton, ConfirmDialog, PriceCell, StatusBadge } from "@/shared/components";
import { PERMISSIONS } from "@/shared/constants/permissions";
import {
  allIdsFailed,
  createEmptyBulkMutationResult,
  CRUD_FILTER_ALL_VALUE,
  type CrudBulkBooleanField,
  CrudBulkBooleanMenu,
  CrudBulkDeleteDialog,
  CrudDeleteDialog,
  CrudListPage,
  CrudListSection,
  CrudListTable,
  useCrudBulkBooleanMutation,
  useCrudBulkDelete,
  useCrudDialog,
  useCrudQuickToggle,
  useCrudTableBulkActions,
} from "@/shared/crud";
import { cn } from "@/shared/design-system/components/ui/utils";
import {
  useLocalization,
  useTranslation,
} from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { useCrudPageGuidance } from "@/shared/guidance";
import { formatDateTime } from "@/shared/lib/datetime.utils";
import { notify } from "@/shared/lib/notifications";
import { toBulkDeleteIds } from "@/shared/lib/api";
import {
  formatBilingualLabel,
  getBilingualTitle,
} from "@/shared/lib/translation-display.utils";

function formatTabCount(count: number | null): string {
  return count == null ? "…" : String(count);
}

export function ProductsPage() {
  const t = useTranslation();
  const { language } = useLocalization();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const guidance = useCrudPageGuidance("products");
  const { canCreate, canUpdate, canDelete, canManage } = useCrudPermissions(PERMISSIONS.MANAGE_PRODUCT);
  const dialog = useCrudDialog<Product>();
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isBulkPriceOpen, setIsBulkPriceOpen] = useState(false);
  const [isBulkPriceSaving, setIsBulkPriceSaving] = useState(false);
  const [quickEditProduct, setQuickEditProduct] = useState<Product | null>(null);
  const [isQuickEditOpen, setIsQuickEditOpen] = useState(false);
  const [duplicateProduct, setDuplicateProduct] = useState<Product | null>(null);
  const [restoreProduct, setRestoreProduct] = useState<Product | null>(null);
  const [forceDeleteProduct, setForceDeleteProduct] = useState<Product | null>(null);
  const [isBulkRestoreOpen, setIsBulkRestoreOpen] = useState(false);
  const [isBulkForceDeleteOpen, setIsBulkForceDeleteOpen] = useState(false);
  const {
    items: products,
    search,
    setSearch,
    resetSearch,
    debouncedSearch,
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
    filterParams,
    sort,
    setSort,
    sortParams,
    sortDefinitions,
    selection,
    isTrash,
    setIsTrash,
    allTotal,
    trashTotal,
  } = useProductsList();

  const { bulkDelete, isBulkDeleting } = useCrudBulkDelete({
    bulkDeleteFn: (ids) => productsService.bulkDelete(ids),
    onSuccess: refetch,
    successDescription: t.productBulkMoveToTrashSuccess,
  });

  const { bulkDelete: bulkRestore, isBulkDeleting: isBulkRestoring } = useCrudBulkDelete({
    bulkDeleteFn: (ids) => productsService.bulkRestore(ids),
    onSuccess: refetch,
    successDescription: t.productBulkRestoreSuccess,
  });

  const { bulkDelete: bulkForceDelete, isBulkDeleting: isBulkForceDeleting } = useCrudBulkDelete({
    bulkDeleteFn: (ids) => productsService.bulkForceDelete(ids),
    onSuccess: refetch,
    successDescription: t.productBulkForceDeleteSuccess,
  });

  const { bulkUpdate, isBulkUpdating } = useCrudBulkBooleanMutation({
    bulkUpdateFn: (ids, field, value) =>
      productsService.bulkUpdate(
        ids.map((id) => ({ id: Number(id), [field]: value }) as ProductBulkUpdateEntry),
      ),
    onSuccess: refetch,
  });

  const productBulkBooleanFields = useMemo<CrudBulkBooleanField[]>(
    () => [
      { field: "featured", label: t.featured },
      { field: "bestSeller", label: t.bestSeller },
      { field: "newlyArrived", label: t.newlyArrived },
      { field: "isProductYouWillLove", label: t.isProductYouWillLove },
      {
        field: "publish",
        label: t.status,
        enableLabel: t.bulkPublish,
        disableLabel: t.bulkUnpublish,
      },
    ],
    [t],
  );

  const handleBulkBooleanUpdate = useCallback(
    async (field: string, value: boolean) => {
      const result = await bulkUpdate(selection.selectedIds, field, value);
      if (result.failedIds.length === 0) {
        selection.clearSelection();
        return;
      }

      const failedIdSet = new Set(result.failedIds.map(String));
      selection.setSelectedIds(
        selection.selectedIds.filter((id) => failedIdSet.has(String(id))),
      );
    },
    [bulkUpdate, selection],
  );

  const selectedProducts = useMemo(
    () => products.filter((product) => selection.selectedIds.includes(product.id)),
    [products, selection.selectedIds],
  );
  const selectedSimpleCount = selectedProducts.filter(
    (product) => normalizeProductType(product.type) === "SIMPLE",
  ).length;
  const selectedVariableCount = selectedProducts.length - selectedSimpleCount;

  const handleBulkPriceSubmit = useCallback(
    async (payload: Omit<ProductBulkAdjustPriceInput, "ids">) => {
      const ids = toBulkDeleteIds(selection.selectedIds);
      if (ids.length === 0) {
        return createEmptyBulkMutationResult();
      }

      if (ids.length > BULK_ADJUST_PRICE_MAX_IDS) {
        notify.error(
          t.errorMessage,
          t.bulkEditPriceTooMany.replace("{max}", String(BULK_ADJUST_PRICE_MAX_IDS)),
        );
        return allIdsFailed(ids, new Error(t.bulkEditPriceTooMany));
      }

      setIsBulkPriceSaving(true);
      const toastId = notify.loading(t.loadingMessage);

      try {
        const result = await productsService.bulkAdjustPrice({ ...payload, ids });
        await refetch();

        const skippedCount = result.skippedIds.length;
        const updatedCount = result.updatedCount;

        if (updatedCount === 0) {
          notify.error(
            t.errorMessage,
            skippedCount > 0 ? t.bulkEditPriceNoSimple : t.bulkEditPriceNoProducts,
            { id: toastId },
          );
          return allIdsFailed(ids, new Error(t.bulkEditPriceNoProducts));
        }

        if (skippedCount > 0) {
          notify.warning(
            t.successMessage,
            t.bulkEditPricePartial
              .replace("{updatedCount}", String(updatedCount))
              .replace("{skippedCount}", String(skippedCount)),
            { id: toastId },
          );
        } else {
          notify.success(
            t.successMessage,
            t.bulkEditPriceSuccess.replace("{count}", String(updatedCount)),
            { id: toastId },
          );
        }

        selection.clearSelection();
        setIsBulkPriceOpen(false);
        return {
          succeededIds: result.updated.map((row) => row.id),
          failedIds: result.skippedIds,
          errors: [],
        };
      } catch (caught) {
        const error =
          caught instanceof Error ? caught : new Error(String(caught ?? "Request failed"));
        notify.error(t.errorMessage, resolveServiceErrorMessage(error, t), { id: toastId });
        return allIdsFailed(ids, error);
      } finally {
        setIsBulkPriceSaving(false);
      }
    },
    [refetch, selection, t],
  );

  const { tableSelectionProps, bulkDeleteDialogProps } = useCrudTableBulkActions({
    selection,
    canDelete: canDelete && !isTrash,
    isDeleting:
      isBulkDeleting ||
      isBulkUpdating ||
      isBulkPriceSaving ||
      isBulkRestoring ||
      isBulkForceDeleting,
    renderExtraActions: () =>
      isTrash ? (
        canDelete ? (
          <>
            <AppButton
              variant="outline"
              size="sm"
              onClick={() => setIsBulkRestoreOpen(true)}
              disabled={isBulkRestoring || isBulkForceDeleting}
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              {t.productBulkRestore}
            </AppButton>
            <AppButton
              variant="destructive"
              size="sm"
              onClick={() => setIsBulkForceDeleteOpen(true)}
              disabled={isBulkRestoring || isBulkForceDeleting}
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
              {t.productBulkForceDelete}
            </AppButton>
          </>
        ) : null
      ) : (
        <>
          {canUpdate ? (
            <AppButton
              variant="outline"
              size="sm"
              onClick={() => setIsBulkPriceOpen(true)}
              disabled={isBulkUpdating || isBulkDeleting || isBulkPriceSaving}
            >
              <Banknote className="size-3.5" aria-hidden="true" />
              {t.bulkEditPrice}
            </AppButton>
          ) : null}
          <CrudBulkBooleanMenu
            fields={productBulkBooleanFields}
            disabled={!canUpdate || isBulkUpdating || isBulkDeleting || isBulkPriceSaving}
            onUpdate={handleBulkBooleanUpdate}
          />
        </>
      ),
    onBulkDelete: bulkDelete,
  });

  const {
    deleteMutation,
    restoreMutation,
    forceDeleteMutation,
    duplicateMutation,
    quickToggle,
    isDeleting,
    isRestoring,
    isForceDeleting,
    isDuplicating,
  } = useProductMutations({
    onSuccess: async () => {
      await refetch();
    },
  });
  const { handleToggle: toggleProductVisibility, isToggleLoading } = useCrudQuickToggle<Product>({
    patchItems,
    toggle: (entity, field, value) =>
      quickToggle(entity, field as ProductQuickToggleField, value),
  });

  const handleToggle = useCallback(
    async (product: Product, field: ProductQuickToggleField, value: boolean) => {
      await toggleProductVisibility(product, field, value);
      guidance.completeChecklistItem("try-visibility");
    },
    [guidance, toggleProductVisibility],
  );

  const openProductEditor = useCallback(
    (product: Product) => {
      navigate(productEditPath(product));
    },
    [navigate],
  );

  const openProductViewer = useCallback(
    (product: Product) => {
      navigate(productViewPath(product));
    },
    [navigate],
  );

  useEffect(() => {
    const raw = searchParams.get("id")?.trim();
    if (!raw) return;
    const id = Number(raw);
    if (!Number.isFinite(id) || id <= 0) return;
    navigate(productViewPath(String(id)), { replace: true });
  }, [navigate, searchParams]);

  const openQuickEdit = useCallback(
    (product: Product) => {
      setQuickEditProduct(product);
      setIsQuickEditOpen(true);
      guidance.completeChecklistItem("try-quick-edit");
    },
    [guidance],
  );

  const applyFilterFromTable = useCallback(
    (filterId: "brandId" | "categoryId" | "tagId", value: string) => {
      filters.setFilter(filterId, value);
      setPage(1);
    },
    [filters, setPage],
  );

  const exportListFilters = useMemo(
    () => ({
      search: debouncedSearch.trim() || undefined,
      ...filterParams,
      ...sortParams,
    }),
    [debouncedSearch, filterParams, sortParams],
  );

  const hasActiveExportListFilters = Boolean(
    debouncedSearch.trim() || filters.hasActiveFilters,
  );
  const activeBrandId =
    filters.values.brandId && filters.values.brandId !== CRUD_FILTER_ALL_VALUE
      ? filters.values.brandId
      : undefined;
  const activeCategoryId =
    filters.values.categoryId && filters.values.categoryId !== CRUD_FILTER_ALL_VALUE
      ? filters.values.categoryId
      : undefined;
  const activeTagId =
    filters.values.tagId && filters.values.tagId !== CRUD_FILTER_ALL_VALUE
      ? filters.values.tagId
      : undefined;
  const activeBadgeValue =
    filters.values.badge && filters.values.badge !== CRUD_FILTER_ALL_VALUE
      ? filters.values.badge
      : undefined;
  const activeBadgeLabel = useMemo(() => {
    if (!activeBadgeValue) return null;

    const badgeLabels: Record<string, string> = {
      featured: t.featured,
      bestSeller: t.bestSeller,
      newlyArrived: t.newlyArrived,
      isProductYouWillLove: t.isProductYouWillLove,
    };

    return badgeLabels[activeBadgeValue] ?? null;
  }, [activeBadgeValue, t]);
  const activeBrandLabel = useMemo(() => {
    if (!activeBrandId) return null;
    const fromOptions = filterDefinitions
      .find((filter) => filter.id === "brandId")
      ?.options.find((option) => option.value === activeBrandId)?.label;
    if (fromOptions) return fromOptions;
    const brand = products.find((product) => String(product.brand?.id) === activeBrandId)?.brand;
    return brand?.title ?? `#${activeBrandId}`;
  }, [activeBrandId, filterDefinitions, products]);
  const activeCategoryLabel = useMemo(() => {
    if (!activeCategoryId) return null;
    const category = products
      .flatMap((product) => product.categories)
      .find((item) => String(item.id) === activeCategoryId);
    return category?.title ?? `#${activeCategoryId}`;
  }, [activeCategoryId, products]);
  const activeTagLabel = useMemo(() => {
    if (!activeTagId) return null;
    const tag = products
      .flatMap((product) => product.tags)
      .find((item) => String(item.id) === activeTagId);
    return tag?.title ?? `#${activeTagId}`;
  }, [activeTagId, products]);

  const firstProductId = products[0]?.id;

  const columns = useMemo(
    () => [
      {
        id: "name",
        hideable: false,
        header: t.product,
        className: "min-w-0 text-start align-middle",
        headerClassName: "text-start align-middle",
        cell: (product: Product) => (
          <ProductRowTitleCell
            product={product}
            mode={isTrash ? "trash" : "active"}
            canUpdate={canUpdate}
            canDelete={canDelete}
            canCreate={canCreate}
            isDuplicating={isDuplicating}
            isRestoring={isRestoring}
            isForceDeleting={isForceDeleting}
            onEdit={openProductEditor}
            onQuickEdit={openQuickEdit}
            onDelete={dialog.openDelete}
            onDuplicate={setDuplicateProduct}
            onRestore={setRestoreProduct}
            onForceDelete={setForceDeleteProduct}
            onOpenTitle={openProductViewer}
            dataGuidance={
              product.id === firstProductId ? guidance.rowActionsDataGuidance : undefined
            }
          />
        ),
      },
      {
        id: "brand",
        header: t.brand,
        className: "text-center align-middle",
        headerClassName: "text-center align-middle",
        cell: (product: Product) =>
          product.brand?.id ? (
          <button
            type="button"
            className="text-sm font-medium text-brand transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2"
            onClick={() => applyFilterFromTable("brandId", String(product.brand.id))}
          >
            {product.brand.title || "—"}
          </button>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          ),
      },
      {
        id: "categories",
        header: t.categoriesCol,
        className: "max-w-xs text-center align-middle",
        headerClassName: "text-center align-middle",
        cell: (product: Product) => (
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {product.categories.map((category) => (
              <button
                key={category.id}
                type="button"
                className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground transition hover:bg-brand-muted hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2"
                onClick={() => applyFilterFromTable("categoryId", String(category.id))}
              >
                {category.title}
              </button>
            ))}
          </div>
        ),
      },
      {
        id: "tags",
        header: t.tags,
        defaultHidden: true,
        className: "max-w-xs text-center align-middle",
        headerClassName: "text-center align-middle",
        cell: (product: Product) => (
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {product.tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground transition hover:bg-brand-muted hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2"
                onClick={() => applyFilterFromTable("tagId", String(tag.id))}
              >
                {tag.title}
              </button>
            ))}
          </div>
        ),
      },
      {
        id: "type",
        header: t.productType,
        defaultHidden: true,
        className: "text-center align-middle",
        headerClassName: "text-center align-middle",
        cell: (product: Product) => (
          <StatusBadge
            label={normalizeProductType(product.type) === "SIMPLE" ? t.productTypeSimple : t.productTypeVariant}
            variant="neutral"
          />
        ),
      },
      {
        id: "price",
        header: t.price,
        className: "text-center align-middle",
        headerClassName: "text-center align-middle",
        cell: (product: Product) => {
          const price = getProductPriceDisplay(product);
          return (
            <PriceCell
              title={price.title}
              lines={price.lines}
              compareAt={price.compareAt}
              className="text-xs"
            />
          );
        },
      },
      {
        id: "stock",
        header: t.stock,
        className: "text-center align-middle",
        headerClassName: "text-center align-middle",
        cell: (product: Product) => {
          const stockLabel = formatProductStockLabel(product, {
            inStock: t.inStockWithCount,
            lowStock: t.lowStockWithCount,
            outOfStock: t.stockOutOfStock,
          });

          return (
            <span
              className={cn(
                "text-xs font-semibold",
                stockLabel.status === "OUT_OF_STOCK" && "text-rose-600",
                stockLabel.status === "LOW_STOCK" && "text-amber-600",
                stockLabel.status === "IN_STOCK" && "text-emerald-700",
              )}
            >
              {stockLabel.text}
            </span>
          );
        },
      },
      ...(isTrash
        ? [
            {
              id: "deletedAt",
              header: t.productDeletedAt,
              className: "text-center align-middle whitespace-nowrap",
              headerClassName: "text-center align-middle",
              cell: (product: Product) => (
                <span className="text-xs text-muted-foreground">
                  {product.deletedAt ? formatDateTime(product.deletedAt, language) : "—"}
                </span>
              ),
            },
          ]
        : [
            {
              id: "rating",
              header: t.rating,
              defaultHidden: true,
              className: "text-center align-middle",
              headerClassName: "text-center align-middle",
              cell: (product: Product) => (
                <span className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-amber-600">
                  {product.averageRating != null ? (
                    <>
                      <Star className="size-3 fill-current" aria-hidden="true" />
                      {product.averageRating}
                    </>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </span>
              ),
            },
            {
              id: "visibility",
              header: t.productVisibility,
              className: "whitespace-nowrap text-center align-middle",
              headerClassName: "text-center align-middle",
              cell: (product: Product) => (
                <ProductVisibilityBadges
                  product={product}
                  compact
                  canUpdate={canUpdate}
                  onToggle={(field, value) => void handleToggle(product, field, value)}
                  isToggleLoading={(field) => isToggleLoading(product.id, field)}
                  dataGuidance={
                    product.id === firstProductId ? guidance.statusDataGuidance : undefined
                  }
                />
              ),
            },
          ]),
    ],
    [
      applyFilterFromTable,
      canCreate,
      canDelete,
      canUpdate,
      dialog.openDelete,
      firstProductId,
      guidance.rowActionsDataGuidance,
      guidance.statusDataGuidance,
      handleToggle,
      isDuplicating,
      isForceDeleting,
      isRestoring,
      isToggleLoading,
      isTrash,
      language,
      openProductEditor,
      openProductViewer,
      openQuickEdit,
      t,
    ],
  );

  return (
    <CrudListPage
      {...guidance.pageProps}
      title={t.products2}
      actions={
        !isTrash && (canCreate || canManage) ? (
          <div className="flex flex-wrap items-center gap-2">
            {canManage ? (
              <AppButton variant="outline" onClick={() => setIsImportDialogOpen(true)}>
                <Upload className="size-4" aria-hidden="true" />
                {t.importData}
              </AppButton>
            ) : null}
            {canCreate ? (
              <AppButton onClick={() => navigate(ROUTES.admin.productNew)}>
                <Plus className="size-4" aria-hidden="true" />
                {t.addProduct}
              </AppButton>
            ) : null}
          </div>
        ) : undefined
      }
    >
      <CrudListSection
        toolbar={
          <div className="mb-1 border-b border-border">
            <div className="flex flex-wrap items-center gap-1 text-sm" role="tablist" aria-label={t.products2}>
              <button
                type="button"
                role="tab"
                aria-selected={!isTrash}
                className={cn(
                  "-mb-px border-b-2 px-3 py-2 font-medium transition-colors",
                  !isTrash
                    ? "border-brand text-brand"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
                onClick={() => setIsTrash(false)}
              >
                {t.productListTabAll} ({formatTabCount(allTotal)})
              </button>
              {canDelete ? (
                <button
                  type="button"
                  role="tab"
                  aria-selected={isTrash}
                  className={cn(
                    "-mb-px border-b-2 px-3 py-2 font-medium transition-colors",
                    isTrash
                      ? "border-brand text-brand"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                  onClick={() => setIsTrash(true)}
                >
                  {t.productListTabTrash} ({formatTabCount(trashTotal)})
                </button>
              ) : null}
            </div>
          </div>
        }
      >
        <CrudListTable
          guidanceAnchors={{
            search: guidance.searchDataGuidance,
            filters: guidance.filtersDataGuidance,
            rowActions: guidance.rowActionsDataGuidance,
          }}
          tableId={isTrash ? "products-trashed" : "products"}
          onExportCsv={isTrash ? undefined : () => setIsExportDialogOpen(true)}
          isExportingCsv={false}
          search={{
            value: search,
            onChange: setSearch,
            onReset: resetSearch,
            placeholder: t.searchProducts,
          }}
          filters={{
            definitions: filterDefinitions,
            values: filters.values,
            onChange: filters.setFilter,
            onReset: filters.resetFilters,
            hasActiveFilters: filters.hasActiveFilters,
          }}
          sort={{ definitions: sortDefinitions, value: sort, onChange: setSort }}
          toolbarActions={
            activeBrandLabel || activeCategoryLabel || activeTagLabel || activeBadgeLabel ? (
              <div className="flex flex-wrap items-center gap-2">
                {activeBadgeLabel ? (
                  <AppButton
                    variant="outline"
                    size="sm"
                    className="h-7 rounded-lg text-xs"
                    onClick={() => {
                      filters.setFilter("badge", CRUD_FILTER_ALL_VALUE);
                      setPage(1);
                    }}
                  >
                    {t.productBadge}: {activeBadgeLabel} ×
                  </AppButton>
                ) : null}
                {activeBrandLabel ? (
                  <AppButton
                    variant="outline"
                    size="sm"
                    className="h-7 rounded-lg text-xs"
                    onClick={() => applyFilterFromTable("brandId", CRUD_FILTER_ALL_VALUE)}
                  >
                    {t.brand}: {activeBrandLabel} ×
                  </AppButton>
                ) : null}
                {activeCategoryLabel ? (
                  <AppButton
                    variant="outline"
                    size="sm"
                    className="h-7 rounded-lg text-xs"
                    onClick={() => applyFilterFromTable("categoryId", CRUD_FILTER_ALL_VALUE)}
                  >
                    {t.categoriesCol}: {activeCategoryLabel} ×
                  </AppButton>
                ) : null}
                {activeTagLabel ? (
                  <AppButton
                    variant="outline"
                    size="sm"
                    className="h-7 rounded-lg text-xs"
                    onClick={() => applyFilterFromTable("tagId", CRUD_FILTER_ALL_VALUE)}
                  >
                    {t.tags}: {activeTagLabel} ×
                  </AppButton>
                ) : null}
              </div>
            ) : undefined
          }
          {...tableSelectionProps}
          columns={columns}
          data={products}
          isLoading={isLoading}
          isError={isError}
          errorTitle={t.errorStateDefaultTitle}
          errorDescription={resolveServiceErrorMessage(error, t)}
          retryLabel={t.tryAgain}
          onRetry={() => void refetch()}
          emptyTitle={isTrash ? t.productTrashEmptyTitle : t.noData}
          emptyDescription={
            isTrash ? t.productTrashEmptyDescription : t.emptyStateDefaultDescription
          }
          showingLabel={`${t.showing} ${products.length} ${t.of} ${total} ${t.results}`}
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
          caption={t.products2}
        />
      </CrudListSection>

      <ProductQuickEditDrawer
        open={isQuickEditOpen}
        product={quickEditProduct}
        onOpenChange={(open) => {
          setIsQuickEditOpen(open);
          if (!open) setQuickEditProduct(null);
        }}
        onSuccess={refetch}
      />

      <ProductImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onSuccess={refetch}
      />

      <ProductExportDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        listFilters={exportListFilters}
        hasActiveListFilters={hasActiveExportListFilters}
      />

      <CrudBulkDeleteDialog
        {...bulkDeleteDialogProps}
        title={t.productBulkMoveToTrashTitle.replace(
          "{count}",
          String(bulkDeleteDialogProps.selectedCount),
        )}
        description={t.productBulkMoveToTrashDescription}
        confirmLabel={t.productMoveToTrashConfirm}
      />

      <ConfirmDialog
        open={isBulkRestoreOpen}
        onOpenChange={setIsBulkRestoreOpen}
        title={t.productBulkRestoreTitle.replace("{count}", String(selection.selectedIds.length))}
        description={t.productBulkRestoreDescription}
        confirmLabel={t.productRestoreConfirm}
        cancelLabel={t.cancel}
        isLoading={isBulkRestoring}
        onConfirm={async () => {
          const result = await bulkRestore(selection.selectedIds);
          if (result.failedIds.length === 0) {
            selection.clearSelection();
          } else {
            const failedIdSet = new Set(result.failedIds.map(String));
            selection.setSelectedIds(
              selection.selectedIds.filter((id) => failedIdSet.has(String(id))),
            );
          }
          setIsBulkRestoreOpen(false);
        }}
      />

      <ConfirmDialog
        open={isBulkForceDeleteOpen}
        onOpenChange={setIsBulkForceDeleteOpen}
        title={t.productBulkForceDeleteTitle.replace(
          "{count}",
          String(selection.selectedIds.length),
        )}
        description={t.productBulkForceDeleteDescription}
        confirmLabel={t.productForceDeleteConfirm}
        cancelLabel={t.cancel}
        variant="destructive"
        isLoading={isBulkForceDeleting}
        onConfirm={async () => {
          const result = await bulkForceDelete(selection.selectedIds);
          if (result.failedIds.length === 0) {
            selection.clearSelection();
          } else {
            const failedIdSet = new Set(result.failedIds.map(String));
            selection.setSelectedIds(
              selection.selectedIds.filter((id) => failedIdSet.has(String(id))),
            );
          }
          setIsBulkForceDeleteOpen(false);
        }}
      />

      <ProductBulkPriceDialog
        open={isBulkPriceOpen}
        onOpenChange={setIsBulkPriceOpen}
        selectedCount={selection.selectedIds.length}
        simpleCount={selectedSimpleCount}
        variableCount={selectedVariableCount}
        isLoading={isBulkPriceSaving}
        onSubmit={handleBulkPriceSubmit}
      />

      <ConfirmDialog
        open={duplicateProduct != null}
        onOpenChange={(open) => {
          if (!open && !isDuplicating) setDuplicateProduct(null);
        }}
        title={t.productDuplicateConfirmTitle}
        description={
          duplicateProduct
            ? `${formatBilingualLabel(
                getBilingualTitle(duplicateProduct.translations, duplicateProduct.title),
              )}. ${t.productDuplicateConfirmDescription}`
            : t.productDuplicateConfirmDescription
        }
        confirmLabel={t.productDuplicateConfirm}
        cancelLabel={t.cancel}
        isLoading={isDuplicating}
        onConfirm={async () => {
          if (!duplicateProduct) return;
          const result = await duplicateMutation.mutate(duplicateProduct);
          if (result.ok) {
            setDuplicateProduct(null);
            if (result.data?.id) {
              navigate(productEditPath(result.data));
            }
          }
        }}
      />

      <CrudDeleteDialog
        open={dialog.mode === "delete"}
        onOpenChange={(open) => {
          if (!open) dialog.close();
        }}
        title={
          dialog.entity
            ? `${t.productMoveToTrashConfirm}: ${formatBilingualLabel(
                getBilingualTitle(dialog.entity.translations, dialog.entity.title),
              )}`
            : t.productMoveToTrashTitle
        }
        description={t.productMoveToTrashDescription}
        confirmLabel={t.productMoveToTrashConfirm}
        isLoading={isDeleting}
        onConfirm={async () => {
          if (dialog.entity) {
            const result = await deleteMutation.mutate(dialog.entity);
            if (result.ok) dialog.close();
          }
        }}
      />

      <ConfirmDialog
        open={restoreProduct != null}
        onOpenChange={(open) => {
          if (!open && !isRestoring) setRestoreProduct(null);
        }}
        title={t.productRestoreConfirmTitle}
        description={
          restoreProduct
            ? `${formatBilingualLabel(
                getBilingualTitle(restoreProduct.translations, restoreProduct.title),
              )}. ${t.productRestoreConfirmDescription}`
            : t.productRestoreConfirmDescription
        }
        confirmLabel={t.productRestoreConfirm}
        cancelLabel={t.cancel}
        isLoading={isRestoring}
        onConfirm={async () => {
          if (!restoreProduct) return;
          const result = await restoreMutation.mutate(restoreProduct);
          if (result.ok) setRestoreProduct(null);
        }}
      />

      <ConfirmDialog
        open={forceDeleteProduct != null}
        onOpenChange={(open) => {
          if (!open && !isForceDeleting) setForceDeleteProduct(null);
        }}
        title={t.productForceDeleteTitle}
        description={
          forceDeleteProduct
            ? `${formatBilingualLabel(
                getBilingualTitle(forceDeleteProduct.translations, forceDeleteProduct.title),
              )}. ${t.productForceDeleteDescription}`
            : t.productForceDeleteDescription
        }
        confirmLabel={t.productForceDeleteConfirm}
        cancelLabel={t.cancel}
        variant="destructive"
        isLoading={isForceDeleting}
        onConfirm={async () => {
          if (!forceDeleteProduct) return;
          const result = await forceDeleteMutation.mutate(forceDeleteProduct);
          if (result.ok) setForceDeleteProduct(null);
        }}
      />
    </CrudListPage>
  );
}
