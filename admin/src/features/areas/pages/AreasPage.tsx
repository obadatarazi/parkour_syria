import { Plus } from "lucide-react";
import { useMemo } from "react";

import { AreaFormDrawer } from "@/features/areas/components/AreaFormDrawer";
import { AreaViewDialog } from "@/features/areas/components/AreaViewDialog";
import { useAreaMutations } from "@/features/areas/hooks/use-area-mutations";
import { useAreasList } from "@/features/areas/hooks/use-areas-list";
import { areasService } from "@/features/areas/services/areas.service";
import type { Area } from "@/features/areas/types/areas.types";
import { useCrudPermissions } from "@/features/auth";
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
import { getBilingualField, pickLocaleText } from "@/shared/lib/api/locale-fields.utils";

export function AreasPage() {
  const t = useTranslation();
  const { canCreate, canUpdate, canDelete } = useCrudPermissions(PERMISSIONS.MANAGE_AREA);
  const dialog = useCrudDialog<Area>();
  const list = useAreasList();

  const { bulkDelete, isBulkDeleting } = useCrudBulkDelete({
    bulkDeleteFn: (ids) => areasService.bulkDelete(ids),
    onSuccess: list.refetch,
  });
  const { tableSelectionProps, bulkDeleteDialogProps } = useCrudTableBulkActions({
    selection: list.selection,
    canDelete,
    isDeleting: isBulkDeleting,
    onBulkDelete: bulkDelete,
  });

  const { deleteMutation, quickToggle, isDeleting } = useAreaMutations({
    onSuccess: async () => {
      dialog.close();
      await list.refetch();
    },
  });
  const { handleToggle, isToggleLoading } = useCrudQuickToggle<Area>({
    patchItems: list.patchItems,
    toggle: quickToggle,
  });

  const rowActions = useCrudRowActions<Area>({ dialog, canUpdate, canDelete, t });

  const columns = useMemo(
    () => [
      {
        id: "name",
        hideable: false,
        header: t.fieldName,
        cell: (area: Area) => (
          <CrudEntityNameCell
            placeholder="📍"
            onClick={() => dialog.openView(area)}
            actions={<CrudTableActions entity={area} actions={rowActions} ariaLabel={t.actions} />}
          >
            <BilingualText values={getBilingualField(area.translations, "name", area.name)} />
          </CrudEntityNameCell>
        ),
      },
      {
        id: "slug",
        header: t.slug,
        cell: (area: Area) => (
          <span dir="ltr" className="font-mono text-xs text-muted-foreground">
            {area.slug}
          </span>
        ),
      },
      {
        id: "sortOrder",
        header: t.sortOrder,
        className: "w-24 text-center",
        headerClassName: "text-center",
        cell: (area: Area) => area.sortOrder,
      },
      {
        id: "publish",
        header: t.publish,
        className: "w-28 text-center",
        headerClassName: "text-center",
        cell: (area: Area) => (
          <CrudTableBooleanToggle
            entity={area}
            field="publish"
            checked={area.publish}
            canUpdate={canUpdate}
            isLoading={isToggleLoading(area.id, "publish")}
            ariaLabel={`${t.publish}: ${pickLocaleText(area.translations, "name", area.name)}`}
            onToggle={(entity, field, value) => void handleToggle(entity, field, value)}
          />
        ),
      },
    ],
    [canUpdate, dialog, handleToggle, isToggleLoading, rowActions, t],
  );

  return (
    <CrudListPage
      title={t.navAreas}
      actions={
        canCreate ? (
          <AppButton onClick={dialog.openCreate}>
            <Plus className="size-4" aria-hidden="true" />
            {t.addArea}
          </AppButton>
        ) : undefined
      }
    >
      <CrudListSection>
        <CrudListTable
          tableId="areas"
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
          caption={t.navAreas}
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

      <AreaViewDialog
        open={dialog.mode === "view"}
        area={dialog.entity}
        canUpdate={canUpdate}
        canDelete={canDelete}
        onOpenChange={(open) => !open && dialog.close()}
        onEdit={dialog.openEdit}
        onDelete={dialog.openDelete}
      />

      <AreaFormDrawer
        open={dialog.mode === "create" || dialog.mode === "edit"}
        mode={dialog.mode === "edit" ? "edit" : "create"}
        area={dialog.entity}
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
