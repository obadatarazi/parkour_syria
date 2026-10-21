import { Package, Plus } from "lucide-react";
import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router";

import { productsByBrandPath } from "@/app/router/routes";
import { canAccessRoute, useAbility, useCrudPermissions } from "@/features/auth";
import { BrandFormDrawer } from "@/features/brands/components/BrandFormDrawer";
import { BrandViewDialog } from "@/features/brands/components/BrandViewDialog";
import {
  type BrandQuickToggleField,
  useBrandMutations,
} from "@/features/brands/hooks/use-brand-mutations";
import { useBrandsList } from "@/features/brands/hooks/use-brands-list";
import { brandsService } from "@/features/brands/services/brands.service";
import type { Brand } from "@/features/brands/types/brands.types";
import { AppButton, BilingualText, BrandImagePlaceholder } from "@/shared/components";
import { PERMISSIONS } from "@/shared/constants/permissions";
import {
  CrudBulkDeleteDialog,
  CrudDeleteDialog,
  CrudEntityNameCell,
  CrudListPage,
  CrudListSection,
  CrudListTable,
  CrudTableActions,
  CrudTableBooleanToggle,
  useCrudBulkDelete,
  useCrudDialog,
  useCrudQuery,
  useCrudQuickToggle,
  useCrudRowActions,
  useCrudTableBulkActions,
} from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { useCrudPageGuidance } from "@/shared/guidance";
import {
  formatBilingualLabel,
  getBilingualTitle,
} from "@/shared/lib/translation-display.utils";

export function BrandsPage() {
  const t = useTranslation();
  const navigate = useNavigate();
  const ability = useAbility();
  const guidance = useCrudPageGuidance("brands");
  const { canCreate, canUpdate, canDelete } = useCrudPermissions(PERMISSIONS.MANAGE_BRAND);
  const canOpenProducts = canAccessRoute(ability, PERMISSIONS.MANAGE_PRODUCT);
  const dialog = useCrudDialog<Brand>();
  const {
    items: brands,
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
    sort,
    setSort,
    sortDefinitions,
    selection,
    exportCsv,
    isExportingCsv,
  } = useBrandsList();

  const { bulkDelete, isBulkDeleting } = useCrudBulkDelete({
    bulkDeleteFn: (ids) => brandsService.bulkDelete(ids),
    onSuccess: refetch,
  });

  const { tableSelectionProps, bulkDeleteDialogProps } = useCrudTableBulkActions({
    selection,
    canDelete,
    isDeleting: isBulkDeleting,
    onBulkDelete: bulkDelete,
  });

  const { deleteMutation, quickToggle, isDeleting } = useBrandMutations({
    onSuccess: async () => {
      await refetch();
    },
  });
  const { handleToggle, isToggleLoading } = useCrudQuickToggle<Brand>({
    patchItems,
    toggle: (entity, field, value) =>
      quickToggle(entity, field as BrandQuickToggleField, value),
  });

  const formMode = dialog.mode === "edit" ? "edit" : "create";
  const isFormOpen = dialog.mode === "create" || dialog.mode === "edit";

  // List is slim (no description). View loads Details via getById.
  const { data: brandDetail } = useCrudQuery({
    queryKey: ["brands", "detail", String(dialog.entity?.id ?? "")],
    queryFn: () => brandsService.getById(dialog.entity!.id),
    enabled: dialog.mode === "view" && Boolean(dialog.entity?.id),
  });

  const viewingBrand = useMemo(() => {
    if (!dialog.entity || dialog.mode !== "view") return null;
    return (
      brandDetail ??
      brands.find((brand) => brand.id === dialog.entity?.id) ??
      dialog.entity
    );
  }, [brandDetail, brands, dialog.entity, dialog.mode]);

  const baseRowActions = useCrudRowActions<Brand>({
    dialog,
    canUpdate,
    canDelete,
    t,
    includeView: false,
  });

  const openBrandProducts = useCallback(
    (brand: Brand) => {
      navigate(productsByBrandPath(brand.id));
    },
    [navigate],
  );

  const rowActions = useMemo(() => {
    if (!canOpenProducts) return baseRowActions;
    return [
      {
        id: "view-products",
        label: t.viewBrandProducts,
        icon: Package,
        onSelect: openBrandProducts,
      },
      ...baseRowActions,
    ];
  }, [baseRowActions, canOpenProducts, openBrandProducts, t.viewBrandProducts]);

  const columns = useMemo(
    () => [
      {
        id: "name",
        hideable: false,
        header: t.name,
        cell: (brand: Brand) => (
          <CrudEntityNameCell
            imageUrl={brand.logoFileUrl}
            placeholder={<BrandImagePlaceholder />}
            onClick={() => dialog.openView(brand)}
            actions={
              <CrudTableActions entity={brand} actions={rowActions} ariaLabel={t.actions} />
            }
          >
            <BilingualText values={getBilingualTitle(brand.translations, brand.title)} />
          </CrudEntityNameCell>
        ),
      },
      ...(canOpenProducts
        ? [
            {
              id: "products",
              header: t.products2,
              className: "w-36 text-center",
              headerClassName: "text-center",
              cell: (brand: Brand) => (
                <button
                  type="button"
                  className="text-sm font-medium text-brand transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2"
                  onClick={() => openBrandProducts(brand)}
                >
                  {t.viewBrandProducts}
                </button>
              ),
            },
          ]
        : []),
      {
        id: "status",
        header: t.status,
        className: "w-28 text-center",
        headerClassName: "text-center",
        cell: (brand: Brand) => (
          <CrudTableBooleanToggle
            entity={brand}
            field="publish"
            checked={brand.publish ?? false}
            canUpdate={canUpdate}
            isLoading={isToggleLoading(brand.id, "publish")}
            ariaLabel={formatBilingualLabel(getBilingualTitle(brand.translations, brand.title))}
            onToggle={(entity, field, value) => void handleToggle(entity, field, value)}
          />
        ),
      },
    ],
    [canOpenProducts, canUpdate, dialog, handleToggle, isToggleLoading, openBrandProducts, rowActions, t],
  );

  return (
    <CrudListPage
      {...guidance.pageProps}
      title={t.brands}
      actions={
        canCreate ? (
          <AppButton onClick={dialog.openCreate}>
            <Plus className="size-4" aria-hidden="true" />
            {t.addBrand}
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
          tableId="brands"
          onExportCsv={exportCsv}
          isExportingCsv={isExportingCsv}
          search={{ value: search, onChange: setSearch, onReset: resetSearch }}
          filters={{
            definitions: filterDefinitions,
            values: filters.values,
            onChange: filters.setFilter,
            onReset: filters.resetFilters,
            hasActiveFilters: filters.hasActiveFilters,
          }}
          sort={{ definitions: sortDefinitions, value: sort, onChange: setSort }}
          {...tableSelectionProps}
          columns={columns}
          data={brands}
          isLoading={isLoading}
          isError={isError}
          errorTitle={t.errorStateDefaultTitle}
          errorDescription={resolveServiceErrorMessage(error, t)}
          retryLabel={t.tryAgain}
          onRetry={() => void refetch()}
          emptyTitle={t.noData}
          emptyDescription={t.emptyStateDefaultDescription}
          caption={t.brands}
          showingLabel={`${t.showing} ${brands.length} ${t.of} ${total} ${t.results}`}
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

      <BrandViewDialog
        open={dialog.mode === "view"}
        brand={viewingBrand}
        canUpdate={canUpdate}
        canDelete={canDelete}
        canViewProducts={canOpenProducts}
        onOpenChange={(open) => {
          if (!open) dialog.close();
        }}
        onEdit={(brand) => dialog.openEdit(brand)}
        onDelete={(brand) => dialog.openDelete(brand)}
        onViewProducts={openBrandProducts}
      />

      <BrandFormDrawer
        open={isFormOpen}
        mode={formMode}
        brand={dialog.entity}
        onOpenChange={(open) => {
          if (!open) dialog.close();
        }}
        onSuccess={refetch}
      />

      <CrudBulkDeleteDialog {...bulkDeleteDialogProps} />

      <CrudDeleteDialog
        open={dialog.mode === "delete"}
        onOpenChange={(open) => {
          if (!open) dialog.close();
        }}
        entityLabel={
          dialog.entity
            ? formatBilingualLabel(getBilingualTitle(dialog.entity.translations, dialog.entity.title))
            : undefined
        }
        isLoading={isDeleting}
        onConfirm={async () => {
          if (dialog.entity) {
            const result = await deleteMutation.mutate(dialog.entity);
            if (result.ok) dialog.close();
          }
        }}
      />
    </CrudListPage>
  );
}
