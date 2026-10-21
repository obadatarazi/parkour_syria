import { Plus } from "lucide-react";
import { useMemo } from "react";

import { useCrudPermissions } from "@/features/auth";
import { DirectoryEntryFormDrawer } from "@/features/directory-entries/components/DirectoryEntryFormDrawer";
import { DirectoryEntryViewDialog } from "@/features/directory-entries/components/DirectoryEntryViewDialog";
import { useDirectoryEntriesList } from "@/features/directory-entries/hooks/use-directory-entries-list";
import { useDirectoryEntryMutations } from "@/features/directory-entries/hooks/use-directory-entry-mutations";
import { directoryEntriesService } from "@/features/directory-entries/services/directory-entries.service";
import type { DirectoryEntry } from "@/features/directory-entries/types/directory-entries.types";
import { directoryEntryTypeLabel } from "@/features/directory-entries/utils/directory-entry-labels";
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
import { getBilingualField, pickLocaleText } from "@/shared/lib/api/locale-fields.utils";

export function DirectoryEntriesPage() {
  const t = useTranslation();
  const { canCreate, canUpdate, canDelete } = useCrudPermissions(PERMISSIONS.MANAGE_DIRECTORY_ENTRY);
  const dialog = useCrudDialog<DirectoryEntry>();
  const list = useDirectoryEntriesList();

  const { bulkDelete, isBulkDeleting } = useCrudBulkDelete({
    bulkDeleteFn: (ids) => directoryEntriesService.bulkDelete(ids),
    onSuccess: list.refetch,
  });
  const { tableSelectionProps, bulkDeleteDialogProps } = useCrudTableBulkActions({
    selection: list.selection,
    canDelete,
    isDeleting: isBulkDeleting,
    onBulkDelete: bulkDelete,
  });

  const { deleteMutation, quickToggle, isDeleting } = useDirectoryEntryMutations({
    onSuccess: async () => {
      dialog.close();
      await list.refetch();
    },
  });
  const { handleToggle, isToggleLoading } = useCrudQuickToggle<DirectoryEntry>({
    patchItems: list.patchItems,
    toggle: quickToggle,
  });

  const rowActions = useCrudRowActions<DirectoryEntry>({ dialog, canUpdate, canDelete, t });

  const columns = useMemo(
    () => [
      {
        id: "name",
        hideable: false,
        header: t.fieldName,
        cell: (entry: DirectoryEntry) => (
          <CrudEntityNameCell
            imageUrl={entry.imageFileUrl}
            placeholder="🧗"
            size="md"
            onClick={() => dialog.openView(entry)}
            actions={<CrudTableActions entity={entry} actions={rowActions} ariaLabel={t.actions} />}
          >
            <BilingualText values={getBilingualField(entry.translations, "name", entry.name)} />
          </CrudEntityNameCell>
        ),
      },
      {
        id: "type",
        header: t.directoryType,
        className: "w-28",
        cell: (entry: DirectoryEntry) => (
          <StatusBadge label={directoryEntryTypeLabel(t, entry.type)} variant="info" />
        ),
      },
      {
        id: "area",
        header: t.fieldArea,
        cell: (entry: DirectoryEntry) =>
          entry.area?.name || <span className="text-muted-foreground">—</span>,
      },
      {
        id: "verified",
        header: t.fieldVerified,
        className: "w-28 text-center",
        headerClassName: "text-center",
        cell: (entry: DirectoryEntry) => (
          <CrudTableBooleanToggle
            entity={entry}
            field="verified"
            checked={entry.verified}
            canUpdate={canUpdate}
            isLoading={isToggleLoading(entry.id, "verified")}
            ariaLabel={`${t.fieldVerified}: ${pickLocaleText(entry.translations, "name", entry.name)}`}
            onToggle={(entity, field, value) => void handleToggle(entity, field, value)}
          />
        ),
      },
      {
        id: "publish",
        header: t.publish,
        className: "w-28 text-center",
        headerClassName: "text-center",
        cell: (entry: DirectoryEntry) => (
          <CrudTableBooleanToggle
            entity={entry}
            field="publish"
            checked={entry.publish}
            canUpdate={canUpdate}
            isLoading={isToggleLoading(entry.id, "publish")}
            ariaLabel={`${t.publish}: ${pickLocaleText(entry.translations, "name", entry.name)}`}
            onToggle={(entity, field, value) => void handleToggle(entity, field, value)}
          />
        ),
      },
    ],
    [canUpdate, dialog, handleToggle, isToggleLoading, rowActions, t],
  );

  return (
    <CrudListPage
      title={t.navDirectory}
      actions={
        canCreate ? (
          <AppButton onClick={dialog.openCreate}>
            <Plus className="size-4" aria-hidden="true" />
            {t.addDirectoryEntry}
          </AppButton>
        ) : undefined
      }
    >
      <CrudListSection>
        <CrudListTable
          tableId="directory-entries"
          onExportCsv={list.exportCsv}
          isExportingCsv={list.isExportingCsv}
          search={{ value: list.search, onChange: list.setSearch, onReset: list.resetSearch }}
          filters={{
            definitions: list.filterDefinitions,
            values: list.filters.values,
            onChange: list.filters.setFilter,
            onReset: list.filters.resetFilters,
            hasActiveFilters: list.filters.hasActiveFilters,
          }}
          sort={{ definitions: list.sortDefinitions, value: list.sort, onChange: list.setSort }}
          {...tableSelectionProps}
          columns={columns}
          data={list.items}
          isLoading={list.isLoading}
          isError={list.isError}
          errorTitle={t.errorStateDefaultTitle}
          errorDescription={resolveServiceErrorMessage(list.error, t)}
          retryLabel={t.tryAgain}
          onRetry={() => void list.refetch()}
          emptyTitle={t.noData}
          emptyDescription={t.emptyStateDefaultDescription}
          caption={t.navDirectory}
          showingLabel={`${t.showing} ${list.items.length} ${t.of} ${list.total} ${t.results}`}
          pagination={{
            page: list.page,
            pageSize: list.pageSize,
            totalItems: list.total,
            onPageChange: list.setPage,
            onPageSizeChange: list.setPageSize,
            pageSizeLabel: t.perPage,
            previousLabel: t.previous,
            nextLabel: t.nextPage,
          }}
        />
      </CrudListSection>

      <DirectoryEntryViewDialog
        open={dialog.mode === "view"}
        entry={dialog.entity}
        canUpdate={canUpdate}
        canDelete={canDelete}
        onOpenChange={(open) => !open && dialog.close()}
        onEdit={dialog.openEdit}
        onDelete={dialog.openDelete}
      />

      <DirectoryEntryFormDrawer
        open={dialog.mode === "create" || dialog.mode === "edit"}
        mode={dialog.mode === "edit" ? "edit" : "create"}
        entry={dialog.entity}
        onOpenChange={(open) => !open && dialog.close()}
        onSuccess={list.refetch}
      />

      <CrudBulkDeleteDialog {...bulkDeleteDialogProps} />

      <CrudDeleteDialog
        open={dialog.mode === "delete"}
        onOpenChange={(open) => !open && dialog.close()}
        entityLabel={dialog.entity ? pickLocaleText(dialog.entity.translations, "name", dialog.entity.name) : undefined}
        isLoading={isDeleting}
        onConfirm={() => {
          if (dialog.entity) void deleteMutation.mutate(dialog.entity);
        }}
      />
    </CrudListPage>
  );
}
