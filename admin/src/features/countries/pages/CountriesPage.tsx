import { Plus } from "lucide-react";
import { useMemo } from "react";

import { useCrudPermissions } from "@/features/auth";
import { CountryFormDrawer } from "@/features/countries/components/CountryFormDrawer";
import { CountryViewDialog } from "@/features/countries/components/CountryViewDialog";
import { useCountriesList } from "@/features/countries/hooks/use-countries-list";
import {
  type CountryQuickToggleField,
  useCountryMutations,
} from "@/features/countries/hooks/use-country-mutations";
import { countriesService } from "@/features/countries/services/countries.service";
import type { Country } from "@/features/countries/types/countries.types";
import { AppButton, BilingualText } from "@/shared/components";
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

export function CountriesPage() {
  const t = useTranslation();
  const guidance = useCrudPageGuidance("countries");
  const { canCreate, canUpdate, canDelete } = useCrudPermissions(PERMISSIONS.MANAGE_COUNTRY);
  const dialog = useCrudDialog<Country>();
  const {
    items: countries,
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
  } = useCountriesList();

  const { bulkDelete, isBulkDeleting } = useCrudBulkDelete({
    bulkDeleteFn: (ids) => countriesService.bulkDelete(ids),
    onSuccess: refetch,
  });

  const { tableSelectionProps, bulkDeleteDialogProps } = useCrudTableBulkActions({
    selection,
    canDelete,
    isDeleting: isBulkDeleting,
    onBulkDelete: bulkDelete,
  });

  const { deleteMutation, quickToggle, isDeleting } = useCountryMutations({
    onSuccess: async () => {
      dialog.close();
      await refetch();
    },
  });
  const { handleToggle, isToggleLoading } = useCrudQuickToggle<Country>({
    patchItems,
    toggle: (entity, field, value) =>
      quickToggle(entity, field as CountryQuickToggleField, value),
  });

  const formMode = dialog.mode === "edit" ? "edit" : "create";
  const isFormOpen = dialog.mode === "create" || dialog.mode === "edit";

  const rowActions = useCrudRowActions<Country>({
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
        cell: (country: Country) => (
          <CrudEntityNameCell
            placeholder="🌍"
            size="sm"
            onClick={() => dialog.openView(country)}
            actions={
              <CrudTableActions entity={country} actions={rowActions} ariaLabel={t.actions} />
            }
          >
            <BilingualText values={getBilingualTitle(country.translations, country.title)} />
          </CrudEntityNameCell>
        ),
      },
      {
        id: "countryIso",
        header: t.countryIso,
        className: "w-28",
        cell: (country: Country) => (
          <span className="font-mono text-sm text-foreground">
            {country.countryIso || "—"}
          </span>
        ),
      },
      {
        id: "status",
        header: t.status,
        className: "w-28 text-center",
        headerClassName: "text-center",
        cell: (country: Country) => (
          <CrudTableBooleanToggle
            entity={country}
            field="publish"
            checked={country.publish ?? false}
            canUpdate={canUpdate}
            isLoading={isToggleLoading(country.id, "publish")}
            ariaLabel={`${t.status}: ${formatBilingualLabel(getBilingualTitle(country.translations, country.title))}`}
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
      title={t.countries}
      actions={
        canCreate ? (
          <AppButton onClick={dialog.openCreate}>
            <Plus className="size-4" aria-hidden="true" />
            {t.addCountry}
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
          tableId="countries"
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
          data={countries}
          isLoading={isLoading}
          isError={isError}
          errorTitle={t.errorStateDefaultTitle}
          errorDescription={resolveServiceErrorMessage(error, t)}
          retryLabel={t.tryAgain}
          onRetry={() => void refetch()}
          emptyTitle={t.noData}
          emptyDescription={t.emptyStateDefaultDescription}
          caption={t.countries}
          showingLabel={`${t.showing} ${countries.length} ${t.of} ${total} ${t.results}`}
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

      <CountryViewDialog
        open={dialog.mode === "view"}
        country={dialog.entity}
        canUpdate={canUpdate}
        canDelete={canDelete}
        onOpenChange={(open) => {
          if (!open) dialog.close();
        }}
        onEdit={(country) => dialog.openEdit(country)}
        onDelete={(country) => dialog.openDelete(country)}
      />

      <CountryFormDrawer
        open={isFormOpen}
        mode={formMode}
        country={dialog.entity}
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
        onConfirm={() => {
          if (dialog.entity) void deleteMutation.mutate(dialog.entity);
        }}
      />
    </CrudListPage>
  );
}
