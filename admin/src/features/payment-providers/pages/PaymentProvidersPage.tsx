import { Plus } from "lucide-react";
import { useMemo } from "react";

import { useCrudPermissions } from "@/features/auth";
import { PaymentProviderFormDrawer } from "@/features/payment-providers/components/PaymentProviderFormDrawer";
import { PaymentProviderViewDialog } from "@/features/payment-providers/components/PaymentProviderViewDialog";
import {
  type PaymentProviderQuickToggleField,
  usePaymentProviderMutations,
} from "@/features/payment-providers/hooks/use-payment-provider-mutations";
import { usePaymentProvidersList } from "@/features/payment-providers/hooks/use-payment-providers-list";
import { paymentProvidersService } from "@/features/payment-providers/services/payment-providers.service";
import type { PaymentProvider } from "@/features/payment-providers/types/payment-providers.types";
import {
  AppButton,
  BilingualText,
  BrandImagePlaceholder,
} from "@/shared/components";
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
  getBilingualDescription,
  getBilingualTitle,
} from "@/shared/lib/translation-display.utils";

export function PaymentProvidersPage() {
  const t = useTranslation();
  const guidance = useCrudPageGuidance("payment-providers");
  const { canCreate, canUpdate, canDelete } = useCrudPermissions(
    PERMISSIONS.MANAGE_PAYMENT_PROVIDER,
  );
  const dialog = useCrudDialog<PaymentProvider>();
  const {
    items: paymentProviders,
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
  } = usePaymentProvidersList();

  const { bulkDelete, isBulkDeleting } = useCrudBulkDelete({
    bulkDeleteFn: (ids) => paymentProvidersService.bulkDelete(ids),
    onSuccess: refetch,
  });

  const { tableSelectionProps, bulkDeleteDialogProps } = useCrudTableBulkActions({
    selection,
    canDelete,
    isDeleting: isBulkDeleting,
    onBulkDelete: async (ids) => {
      // List omits `standard` — resolve details before deleting protected rows.
      const details = await Promise.all(
        ids.map((id) => paymentProvidersService.getById(Number(id))),
      );
      const deletableIds = details
        .filter((provider) => !provider.standard)
        .map((provider) => provider.id);
      return bulkDelete(deletableIds);
    },
  });

  const { deleteMutation, quickToggle, isDeleting } = usePaymentProviderMutations({
    onSuccess: async () => {
      await refetch();
    },
  });
  const { handleToggle, isToggleLoading } = useCrudQuickToggle<PaymentProvider>({
    patchItems,
    toggle: (entity, field, value) =>
      quickToggle(entity, field as PaymentProviderQuickToggleField, value),
  });

  const formMode = dialog.mode === "edit" ? "edit" : "create";
  const isFormOpen = dialog.mode === "create" || dialog.mode === "edit";

  // List is slim (no type/standard). View/Delete load Details via getById.
  const { data: providerDetail } = useCrudQuery({
    queryKey: ["payment-providers", "detail", String(dialog.entity?.id ?? "")],
    queryFn: () => paymentProvidersService.getById(dialog.entity!.id),
    enabled:
      (dialog.mode === "view" || dialog.mode === "delete") &&
      Boolean(dialog.entity?.id),
  });

  const viewingProvider = useMemo(() => {
    if (!dialog.entity || dialog.mode !== "view") return null;
    return (
      providerDetail ??
      paymentProviders.find((provider) => provider.id === dialog.entity?.id) ??
      dialog.entity
    );
  }, [dialog.entity, dialog.mode, paymentProviders, providerDetail]);

  const rowActions = useCrudRowActions<PaymentProvider>({
    dialog,
    canUpdate,
    canDelete,
    t,
    includeView: false,
  });

  const columns = useMemo(
    () => [
      {
        id: "name",
        hideable: false,
        header: t.name,
        cell: (provider: PaymentProvider) => (
          <CrudEntityNameCell
            imageUrl={provider.imageFileUrl}
            placeholder={<BrandImagePlaceholder />}
            onClick={() => dialog.openView(provider)}
            actions={
              <CrudTableActions entity={provider} actions={rowActions} ariaLabel={t.actions} />
            }
          >
            <BilingualText values={getBilingualTitle(provider.translations, provider.title)} />
          </CrudEntityNameCell>
        ),
      },
      {
        id: "description",
        header: t.description,
        className: "max-w-xs",
        cell: (provider: PaymentProvider) => (
          <div className="line-clamp-2">
            <BilingualText
              values={getBilingualDescription(provider.translations, provider.description)}
              titleClassName="font-normal text-muted-foreground"
            />
          </div>
        ),
      },
      {
        id: "status",
        header: t.status,
        className: "w-28 text-center",
        headerClassName: "text-center",
        cell: (provider: PaymentProvider) => (
          <CrudTableBooleanToggle
            entity={provider}
            field="publish"
            checked={provider.publish ?? false}
            canUpdate={canUpdate}
            isLoading={isToggleLoading(provider.id, "publish")}
            ariaLabel={formatBilingualLabel(
              getBilingualTitle(provider.translations, provider.title),
            )}
            onToggle={(entity, field, value) => void handleToggle(entity, field, value)}
          />
        ),
      },
    ],
    [canUpdate, dialog, handleToggle, isToggleLoading, rowActions, t],
  );

  return (
    <CrudListPage
      {...guidance.pageProps}
      title={t.paymentProviders}
      actions={
        canCreate ? (
          <AppButton onClick={dialog.openCreate}>
            <Plus className="size-4" aria-hidden="true" />
            {t.addPaymentProvider}
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
          tableId="payment-providers"
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
          data={paymentProviders}
          isLoading={isLoading}
          isError={isError}
          errorTitle={t.errorStateDefaultTitle}
          errorDescription={resolveServiceErrorMessage(error, t)}
          retryLabel={t.tryAgain}
          onRetry={() => void refetch()}
          emptyTitle={t.noData}
          emptyDescription={t.emptyStateDefaultDescription}
          caption={t.paymentProviders}
          showingLabel={`${t.showing} ${paymentProviders.length} ${t.of} ${total} ${t.results}`}
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

      <PaymentProviderViewDialog
        open={dialog.mode === "view"}
        paymentProvider={viewingProvider}
        canUpdate={canUpdate}
        canDelete={canDelete}
        onOpenChange={(open) => {
          if (!open) dialog.close();
        }}
        onEdit={(provider) => dialog.openEdit(provider)}
        onDelete={(provider) => dialog.openDelete(provider)}
      />

      <PaymentProviderFormDrawer
        open={isFormOpen}
        mode={formMode}
        paymentProvider={dialog.entity}
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
            ? formatBilingualLabel(
                getBilingualTitle(dialog.entity.translations, dialog.entity.title),
              )
            : undefined
        }
        isLoading={isDeleting}
        onConfirm={async () => {
          if (!dialog.entity) return;
          const detail =
            providerDetail?.id === dialog.entity.id
              ? providerDetail
              : await paymentProvidersService.getById(dialog.entity.id);
          if (detail.standard) {
            dialog.close();
            return;
          }
          const result = await deleteMutation.mutate(dialog.entity);
          if (result.ok) dialog.close();
        }}
      />
    </CrudListPage>
  );
}
