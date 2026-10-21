import { Plus } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { useCrudPermissions } from "@/features/auth";
import { DeliveryZonesPriceFormDrawer } from "@/features/delivery-zones-prices/components/DeliveryZonesPriceFormDrawer";
import { DeliveryZonesPriceViewDialog } from "@/features/delivery-zones-prices/components/DeliveryZonesPriceViewDialog";
import {
  type DeliveryZonesPriceQuickToggleField,
  useDeliveryZonesPriceMutations,
} from "@/features/delivery-zones-prices/hooks/use-delivery-zones-price-mutations";
import { useDeliveryZonesPricesList } from "@/features/delivery-zones-prices/hooks/use-delivery-zones-prices-list";
import { deliveryZonesPricesService } from "@/features/delivery-zones-prices/services/delivery-zones-prices.service";
import type { DeliveryZonesPrice } from "@/features/delivery-zones-prices/types/delivery-zones-prices.types";
import { InventoryInlineNumberCell } from "@/features/inventory/components/InventoryInlineNumberCell";
import { formatKwd } from "@/features/products/utils/product-display.utils";
import { AppButton, BilingualText, ConfirmDialog } from "@/shared/components";
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

export function DeliveryZonesPricesPage() {
  const t = useTranslation();
  const guidance = useCrudPageGuidance("delivery-zones-prices");
  const { canCreate, canUpdate, canDelete } = useCrudPermissions(
    PERMISSIONS.MANAGE_DELIVERY_ZONES_PRICE,
  );
  const dialog = useCrudDialog<DeliveryZonesPrice>();
  const [unpublishTarget, setUnpublishTarget] = useState<DeliveryZonesPrice | null>(null);
  const {
    items,
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
  } = useDeliveryZonesPricesList();

  const { bulkDelete, isBulkDeleting } = useCrudBulkDelete({
    bulkDeleteFn: (ids) => deliveryZonesPricesService.bulkDelete(ids),
    onSuccess: refetch,
  });

  const { tableSelectionProps, bulkDeleteDialogProps } = useCrudTableBulkActions({
    selection,
    canDelete,
    isDeleting: isBulkDeleting,
    onBulkDelete: bulkDelete,
  });

  const { deleteMutation, quickToggle, quickUpdateFee, isFeeSaving, isDeleting } =
    useDeliveryZonesPriceMutations({
      onSuccess: async () => {
        dialog.close();
        await refetch();
      },
    });
  const { handleToggle, isToggleLoading } = useCrudQuickToggle<DeliveryZonesPrice>({
    patchItems,
    toggle: (entity, field, value) =>
      quickToggle(entity, field as DeliveryZonesPriceQuickToggleField, value),
  });

  const handleFeeSave = useCallback(
    async (entity: DeliveryZonesPrice, nextValue: number): Promise<boolean> => {
      const previous = entity.deliveryFee;
      patchItems((current) =>
        current.map((item) =>
          item.id === entity.id ? { ...item, deliveryFee: nextValue } : item,
        ),
      );

      const ok = await quickUpdateFee(entity, nextValue);
      if (!ok) {
        patchItems((current) =>
          current.map((item) =>
            item.id === entity.id ? { ...item, deliveryFee: previous } : item,
          ),
        );
      }
      return ok;
    },
    [patchItems, quickUpdateFee],
  );

  const requestPublishToggle = useCallback(
    (entity: DeliveryZonesPrice, field: keyof DeliveryZonesPrice & string, value: boolean) => {
      if (field === "publish" && value === false) {
        setUnpublishTarget(entity);
        return;
      }
      void handleToggle(entity, field, value);
    },
    [handleToggle],
  );

  const confirmUnpublish = useCallback(async () => {
    if (!unpublishTarget) return;
    await handleToggle(unpublishTarget, "publish", false);
    setUnpublishTarget(null);
  }, [handleToggle, unpublishTarget]);

  const formMode = dialog.mode === "edit" ? "edit" : "create";
  const isFormOpen = dialog.mode === "create" || dialog.mode === "edit";
  const unpublishZoneLabel = unpublishTarget?.state
    ? formatBilingualLabel(
        getBilingualTitle(unpublishTarget.state.translations, unpublishTarget.state.title),
      )
    : null;
  const isUnpublishing =
    unpublishTarget != null && isToggleLoading(unpublishTarget.id, "publish");

  const rowActions = useCrudRowActions<DeliveryZonesPrice>({
    dialog,
    canUpdate,
    canDelete,
    t,
    includeView: false,
  });

  const columns = useMemo(
    () => [
      {
        id: "state",
        hideable: false,
        header: t.state,
        cell: (entity: DeliveryZonesPrice) => {
          const title = entity.state
            ? getBilingualTitle(entity.state.translations, entity.state.title)
            : { en: "—", ar: "" };
          return (
            <CrudEntityNameCell
              placeholder="🚚"
              size="sm"
              onClick={() => dialog.openView(entity)}
              actions={
                <CrudTableActions entity={entity} actions={rowActions} ariaLabel={t.actions} />
              }
            >
              <BilingualText values={title} />
            </CrudEntityNameCell>
          );
        },
      },
      {
        id: "deliveryFee",
        header: t.deliveryFee,
        cell: (entity: DeliveryZonesPrice) => (
          <InventoryInlineNumberCell
            value={entity.deliveryFee}
            displayValue={formatKwd(entity.deliveryFee)}
            canEdit={canUpdate}
            disabled={isFeeSaving(entity.id)}
            min={0}
            step={0.01}
            ariaLabel={t.deliveryFee}
            editHint={t.inventoryClickToEdit}
            cancelLabel={t.cancel}
            onSave={(nextValue) => handleFeeSave(entity, nextValue)}
          />
        ),
      },
      {
        id: "status",
        header: t.status,
        className: "w-28 text-center",
        headerClassName: "text-center",
        cell: (entity: DeliveryZonesPrice) => {
          const label = entity.state
            ? formatBilingualLabel(
                getBilingualTitle(entity.state.translations, entity.state.title),
              )
            : String(entity.id);
          return (
            <CrudTableBooleanToggle
              entity={entity}
              field="publish"
              checked={entity.publish ?? false}
              canUpdate={canUpdate}
              isLoading={isToggleLoading(entity.id, "publish")}
              ariaLabel={`${t.status}: ${label}`}
              onToggle={(row, field, value) => requestPublishToggle(row, field, value)}
            />
          );
        },
      },
    ],
    [canUpdate, dialog, handleFeeSave, isFeeSaving, isToggleLoading, requestPublishToggle, rowActions, t],
  );

  return (
    <CrudListPage
      {...guidance.pageProps}
      title={t.deliveryZonesPrices}
      actions={
        canCreate ? (
          <AppButton onClick={dialog.openCreate}>
            <Plus className="size-4" aria-hidden="true" />
            {t.addDeliveryZonesPrice}
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
          tableId="delivery-zones-prices"
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
          data={items}
          isLoading={isLoading}
          isError={isError}
          errorTitle={t.errorStateDefaultTitle}
          errorDescription={resolveServiceErrorMessage(error, t)}
          retryLabel={t.tryAgain}
          onRetry={() => void refetch()}
          emptyTitle={t.noData}
          emptyDescription={t.emptyStateDefaultDescription}
          caption={t.deliveryZonesPrices}
          showingLabel={`${t.showing} ${items.length} ${t.of} ${total} ${t.results}`}
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

      <DeliveryZonesPriceViewDialog
        open={dialog.mode === "view"}
        entity={dialog.entity}
        canUpdate={canUpdate}
        canDelete={canDelete}
        onOpenChange={(open) => {
          if (!open) dialog.close();
        }}
        onEdit={(entity) => dialog.openEdit(entity)}
        onDelete={(entity) => dialog.openDelete(entity)}
      />

      <DeliveryZonesPriceFormDrawer
        open={isFormOpen}
        mode={formMode}
        entity={dialog.entity}
        onOpenChange={(open) => {
          if (!open) dialog.close();
        }}
        onSuccess={refetch}
      />

      <CrudBulkDeleteDialog {...bulkDeleteDialogProps} />

      <ConfirmDialog
        open={unpublishTarget != null}
        onOpenChange={(open) => {
          if (!open && !isUnpublishing) setUnpublishTarget(null);
        }}
        title={t.deliveryZonesPriceUnpublishTitle}
        description={
          unpublishZoneLabel
            ? `${unpublishZoneLabel}. ${t.deliveryZonesPriceUnpublishDescription}`
            : t.deliveryZonesPriceUnpublishDescription
        }
        confirmLabel={t.deliveryZonesPriceUnpublishConfirm}
        cancelLabel={t.cancel}
        variant="destructive"
        isLoading={isUnpublishing}
        onConfirm={() => {
          void confirmUnpublish();
        }}
      />

      <CrudDeleteDialog
        open={dialog.mode === "delete"}
        onOpenChange={(open) => {
          if (!open) dialog.close();
        }}
        entityLabel={
          dialog.entity?.state
            ? formatBilingualLabel(
                getBilingualTitle(
                  dialog.entity.state.translations,
                  dialog.entity.state.title,
                ),
              )
            : dialog.entity
              ? String(dialog.entity.id)
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
