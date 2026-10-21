import { Plus } from "lucide-react";
import { useMemo } from "react";

import { useCrudPermissions } from "@/features/auth";
import { CurrencyFormDrawer } from "@/features/currencies/components/CurrencyFormDrawer";
import { CurrencyViewDialog } from "@/features/currencies/components/CurrencyViewDialog";
import { useCurrenciesList } from "@/features/currencies/hooks/use-currencies-list";
import {
  type CurrencyQuickToggleField,
  useCurrencyMutations,
} from "@/features/currencies/hooks/use-currency-mutations";
import { currenciesService } from "@/features/currencies/services/currencies.service";
import type { Currency } from "@/features/currencies/types/currencies.types";
import { AppButton, BilingualText, StatusBadge } from "@/shared/components";
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

export function CurrenciesPage() {
  const t = useTranslation();
  const guidance = useCrudPageGuidance("currencies");
  const { canCreate, canUpdate, canDelete } = useCrudPermissions(PERMISSIONS.MANAGE_CURRENCY);
  const dialog = useCrudDialog<Currency>();
  const {
    items: currencies,
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
  } = useCurrenciesList();

  const { bulkDelete, isBulkDeleting } = useCrudBulkDelete({
    bulkDeleteFn: (ids) => currenciesService.bulkDelete(ids),
    onSuccess: refetch,
  });

  const { tableSelectionProps, bulkDeleteDialogProps } = useCrudTableBulkActions({
    selection,
    canDelete,
    isDeleting: isBulkDeleting,
    onBulkDelete: async (ids) => {
      const deletableIds = currencies
        .filter((currency) => ids.includes(currency.id) && !currency.isDefault)
        .map((currency) => currency.id);
      return bulkDelete(deletableIds);
    },
  });

  const { deleteMutation, quickToggle, isDeleting } = useCurrencyMutations({
    onSuccess: async () => {
      dialog.close();
      await refetch();
    },
  });
  const { handleToggle, isToggleLoading } = useCrudQuickToggle<Currency>({
    patchItems,
    toggle: (entity, field, value) =>
      quickToggle(entity, field as CurrencyQuickToggleField, value),
  });

  const formMode = dialog.mode === "edit" ? "edit" : "create";
  const isFormOpen = dialog.mode === "create" || dialog.mode === "edit";

  const rowActions = useCrudRowActions<Currency>({
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
        cell: (currency: Currency) => (
          <CrudEntityNameCell
            placeholder={currency.symbol || "💱"}
            size="sm"
            onClick={() => dialog.openView(currency)}
            actions={
              <CrudTableActions
                entity={currency}
                actions={rowActions.map((action) =>
                  action.id === "delete" && currency.isDefault
                    ? { ...action, disabled: true }
                    : action,
                )}
                ariaLabel={t.actions}
              />
            }
          >
            <BilingualText values={getBilingualTitle(currency.translations, currency.title)} />
          </CrudEntityNameCell>
        ),
      },
      {
        id: "code",
        header: t.currencyCode,
        className: "w-28",
        cell: (currency: Currency) => (
          <span className="font-mono text-sm text-foreground">{currency.code}</span>
        ),
      },
      {
        id: "symbol",
        header: t.currencySymbol,
        className: "w-24",
        cell: (currency: Currency) => (
          <span className="text-sm text-foreground">{currency.symbol}</span>
        ),
      },
      {
        id: "default",
        header: t.defaultCurrency,
        className: "w-32 text-center",
        headerClassName: "text-center",
        cell: (currency: Currency) =>
          currency.isDefault ? (
            <StatusBadge label={t.defaultCurrency} variant="info" />
          ) : (
            <span className="text-xs text-muted-foreground">{t.notDefaultCurrency}</span>
          ),
      },
      {
        id: "status",
        header: t.status,
        className: "w-28 text-center",
        headerClassName: "text-center",
        cell: (currency: Currency) => (
          <CrudTableBooleanToggle
            entity={currency}
            field="publish"
            checked={currency.publish ?? false}
            canUpdate={canUpdate}
            isLoading={isToggleLoading(currency.id, "publish")}
            ariaLabel={`${t.status}: ${formatBilingualLabel(getBilingualTitle(currency.translations, currency.title))}`}
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
      title={t.currencies}
      actions={
        canCreate ? (
          <AppButton onClick={dialog.openCreate}>
            <Plus className="size-4" aria-hidden="true" />
            {t.addCurrency}
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
          tableId="currencies"
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
          data={currencies}
          isLoading={isLoading}
          isError={isError}
          errorTitle={t.errorStateDefaultTitle}
          errorDescription={resolveServiceErrorMessage(error, t)}
          retryLabel={t.tryAgain}
          onRetry={() => void refetch()}
          emptyTitle={t.noData}
          emptyDescription={t.emptyStateDefaultDescription}
          caption={t.currencies}
          showingLabel={`${t.showing} ${currencies.length} ${t.of} ${total} ${t.results}`}
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

      <CurrencyViewDialog
        open={dialog.mode === "view"}
        currency={dialog.entity}
        canUpdate={canUpdate}
        canDelete={canDelete}
        onOpenChange={(open) => {
          if (!open) dialog.close();
        }}
        onEdit={(currency) => dialog.openEdit(currency)}
        onDelete={(currency) => dialog.openDelete(currency)}
      />

      <CurrencyFormDrawer
        open={isFormOpen}
        mode={formMode}
        currency={dialog.entity}
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
        onConfirm={() => {
          if (dialog.entity && !dialog.entity.isDefault) {
            void deleteMutation.mutate(dialog.entity);
          }
        }}
      />
    </CrudListPage>
  );
}
