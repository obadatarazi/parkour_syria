import { Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo } from "react";

import { useCrudPermissions } from "@/features/auth";
import { StaticPromotionFormDrawer } from "@/features/static-promotions/components/StaticPromotionFormDrawer";
import {
  type StaticPromotionQuickToggleField,
  useStaticPromotionMutations,
} from "@/features/static-promotions/hooks/use-static-promotion-mutations";
import { useStaticPromotionsList } from "@/features/static-promotions/hooks/use-static-promotions-list";
import { staticPromotionsService } from "@/features/static-promotions/services/static-promotions.service";
import type { StaticPromotion } from "@/features/static-promotions/types/static-promotions.types";
import { AppButton, MediaImage } from "@/shared/components";
import { PERMISSIONS } from "@/shared/constants/permissions";
import {
  CrudBulkDeleteDialog,
  CrudDeleteDialog,
  CrudListPage,
  CrudListSection,
  CrudListTable,
  CrudTableActions,
  CrudTableBooleanToggle,
  useCrudBulkDelete,
  useCrudDialog,
  useCrudQuickToggle,
  useCrudTableBulkActions,
} from "@/shared/crud";
import type { CrudRowAction } from "@/shared/crud/types/crud.types";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { useCrudPageGuidance } from "@/shared/guidance";

export function StaticPromotionsPage({ embedded = false }: { embedded?: boolean } = {}) {
  const t = useTranslation();
  const guidance = useCrudPageGuidance("static-promotions");
  const { canCreate, canUpdate, canDelete } = useCrudPermissions(
    PERMISSIONS.MANAGE_STATIC_PROMOTION,
  );
  const dialog = useCrudDialog<StaticPromotion>();
  const {
    items: promotions,
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
  } = useStaticPromotionsList();

  const { bulkDelete, isBulkDeleting } = useCrudBulkDelete({
    bulkDeleteFn: (ids) => staticPromotionsService.bulkDelete(ids),
    onSuccess: refetch,
  });

  const { tableSelectionProps, bulkDeleteDialogProps } = useCrudTableBulkActions({
    selection,
    canDelete,
    isDeleting: isBulkDeleting,
    onBulkDelete: bulkDelete,
  });

  const { deleteMutation, quickToggle, isDeleting } = useStaticPromotionMutations({
    onSuccess: async () => {
      dialog.close();
      await refetch();
    },
  });
  const { handleToggle, isToggleLoading } = useCrudQuickToggle<StaticPromotion>({
    patchItems,
    toggle: (entity, field, value) =>
      quickToggle(entity, field as StaticPromotionQuickToggleField, value),
  });

  const formMode = dialog.mode === "edit" ? "edit" : "create";
  const isFormOpen = dialog.mode === "create" || dialog.mode === "edit";

  const rowActions = useMemo<CrudRowAction<StaticPromotion>[]>(() => {
    const actions: CrudRowAction<StaticPromotion>[] = [];

    if (canUpdate) {
      actions.push({
        id: "edit",
        label: t.editAction,
        icon: Pencil,
        onSelect: (promotion) => dialog.openEdit(promotion),
      });
    }

    if (canDelete) {
      actions.push({
        id: "delete",
        label: t.deleteAction,
        icon: Trash2,
        variant: "destructive",
        onSelect: (promotion) => dialog.openDelete(promotion),
      });
    }

    return actions;
  }, [canDelete, canUpdate, dialog, t]);

  const columns = useMemo(
    () => [
      {
        id: "image",
        header: t.featureImage,
        cell: (promotion: StaticPromotion) =>
          promotion.imageFileUrl ? (
            <MediaImage
              src={promotion.imageFileUrl}
              alt=""
              className="size-12 rounded-lg object-cover"
            />
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        id: "type",
        header: t.promotionType,
        cell: (promotion: StaticPromotion) => promotion.type.label,
      },
      {
        id: "position",
        header: t.position,
        cell: (promotion: StaticPromotion) => promotion.position,
      },
      {
        id: "link",
        header: t.link,
        className: "max-w-xs truncate",
        cell: (promotion: StaticPromotion) => promotion.link ?? "—",
      },
      {
        id: "status",
        header: t.status,
        className: "w-28 text-center",
        headerClassName: "text-center",
        cell: (promotion: StaticPromotion) => (
          <CrudTableBooleanToggle
            entity={promotion}
            field="publish"
            checked={promotion.publish ?? false}
            canUpdate={canUpdate}
            isLoading={isToggleLoading(promotion.id, "publish")}
            ariaLabel={`${t.status}: ${promotion.type.label} #${promotion.id}`}
            onToggle={(entity, field, value) => void handleToggle(entity, field, value)}
          />
        ),
      },
    ],
    [canUpdate, handleToggle, isToggleLoading, t],
  );

  return (
    <CrudListPage
      {...guidance.pageProps}
      title={t.staticPromotions}
      embedded={embedded}
      actions={
        canCreate ? (
          <AppButton onClick={dialog.openCreate}>
            <Plus className="size-4" aria-hidden="true" />
            {t.addStaticPromotion}
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
          tableId="static-promotions"
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
          data={promotions}
          isLoading={isLoading}
          isError={isError}
          errorTitle={t.errorStateDefaultTitle}
          errorDescription={resolveServiceErrorMessage(error, t)}
          retryLabel={t.tryAgain}
          onRetry={() => void refetch()}
          emptyTitle={t.noData}
          emptyDescription={t.emptyStateDefaultDescription}
          rowActions={
            rowActions.length > 0
              ? (promotion) => (
                  <CrudTableActions
                    entity={promotion}
                    actions={rowActions}
                    ariaLabel={t.actions}
                  />
                )
              : undefined
          }
          actionsHeader={rowActions.length > 0 ? t.actions : undefined}
          caption={t.staticPromotions}
          showingLabel={`${t.showing} ${promotions.length} ${t.of} ${total} ${t.results}`}
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

      <StaticPromotionFormDrawer
        open={isFormOpen}
        mode={formMode}
        promotion={dialog.entity}
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
            ? `${dialog.entity.type.label} #${dialog.entity.id}`
            : undefined
        }
        isLoading={isDeleting}
        onConfirm={() => {
          if (dialog.entity) void deleteMutation.mutate(dialog.entity);
        }}
      />
    </CrudListPage>
  );
}
