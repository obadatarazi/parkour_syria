import { Plus } from "lucide-react";
import { useMemo } from "react";

import { useCrudPermissions } from "@/features/auth";
import { HolidayFormDrawer } from "@/features/holidays/components/HolidayFormDrawer";
import { HolidayViewDialog } from "@/features/holidays/components/HolidayViewDialog";
import {
  type HolidayQuickToggleField,
  useHolidayMutations,
} from "@/features/holidays/hooks/use-holiday-mutations";
import { useHolidaysList } from "@/features/holidays/hooks/use-holidays-list";
import { holidaysService } from "@/features/holidays/services/holidays.service";
import type { Holiday } from "@/features/holidays/types/holidays.types";
import { AppButton } from "@/shared/components";
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

export function HolidaysPage() {
  const t = useTranslation();
  const guidance = useCrudPageGuidance("holidays");
  const { canCreate, canUpdate, canDelete } = useCrudPermissions(PERMISSIONS.MANAGE_HOLIDAY);
  const dialog = useCrudDialog<Holiday>();

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
  } = useHolidaysList();

  const { bulkDelete, isBulkDeleting } = useCrudBulkDelete({
    bulkDeleteFn: (ids) => holidaysService.bulkDelete(ids),
    onSuccess: refetch,
  });

  const { tableSelectionProps, bulkDeleteDialogProps } = useCrudTableBulkActions({
    selection,
    canDelete,
    isDeleting: isBulkDeleting,
    onBulkDelete: bulkDelete,
  });

  const { deleteMutation, quickToggle, isDeleting } = useHolidayMutations({
    onSuccess: async () => {
      dialog.close();
      await refetch();
    },
  });

  const { handleToggle, isToggleLoading } = useCrudQuickToggle<Holiday>({
    patchItems,
    toggle: (entity, field, value) =>
      quickToggle(entity, field as HolidayQuickToggleField, value),
  });

  const formMode = dialog.mode === "edit" ? "edit" : "create";
  const isFormOpen = dialog.mode === "create" || dialog.mode === "edit";

  const rowActions = useCrudRowActions<Holiday>({
    dialog,
    canUpdate,
    canDelete,
    t,
    includeView: true,
  });

  const columns = useMemo(
    () => [
      {
        id: "name",
        hideable: false,
        header: t.holidayName,
        cell: (entity: Holiday) => {
          const formattedDate = new Date(entity.date).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
          return (
            <CrudEntityNameCell
              placeholder="📅"
              size="sm"
              onClick={() => dialog.openView(entity)}
              actions={
                <CrudTableActions entity={entity} actions={rowActions} ariaLabel={t.actions} />
              }
            >
              <div className="flex flex-col">
                <span className="font-medium">{entity.name}</span>
                <span className="text-xs text-muted-foreground">{formattedDate}</span>
              </div>
            </CrudEntityNameCell>
          );
        },
      },
      {
        id: "date",
        header: t.holidayDate,
        cell: (entity: Holiday) => {
          const formattedDate = new Date(entity.date).toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          });
          return formattedDate;
        },
      },
      {
        id: "status",
        header: t.status,
        className: "w-28 text-center",
        headerClassName: "text-center",
        cell: (entity: Holiday) => {
          const label = entity.name || String(entity.id);
          return (
            <CrudTableBooleanToggle
              entity={entity}
              field="isActive"
              checked={entity.isActive ?? false}
              canUpdate={canUpdate}
              isLoading={isToggleLoading(entity.id, "isActive")}
              ariaLabel={`${t.status}: ${label}`}
              onToggle={handleToggle}
            />
          );
        },
      },
    ],
    [canUpdate, dialog, handleToggle, isToggleLoading, rowActions, t],
  );

  return (
    <CrudListPage
      {...guidance.pageProps}
      title={t.holidays}
      actions={
        canCreate ? (
          <AppButton onClick={dialog.openCreate}>
            <Plus className="size-4" aria-hidden="true" />
            {t.addHoliday}
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
          tableId="holidays"
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
          caption={t.holidays}
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

      <HolidayViewDialog
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

      <HolidayFormDrawer
        open={isFormOpen}
        mode={formMode}
        entity={dialog.entity}
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
        entityLabel={dialog.entity?.name ?? (dialog.entity ? String(dialog.entity.id) : undefined)}
        isLoading={isDeleting}
        onConfirm={() => {
          if (dialog.entity) void deleteMutation.mutate(dialog.entity);
        }}
      />
    </CrudListPage>
  );
}
