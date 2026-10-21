import { Plus } from "lucide-react";
import { useMemo } from "react";

import { useCrudPermissions } from "@/features/auth";
import { LoyaltyEventFormDrawer } from "@/features/loyalty-events/components/LoyaltyEventFormDrawer";
import { LoyaltyEventViewDialog } from "@/features/loyalty-events/components/LoyaltyEventViewDialog";
import {
  type LoyaltyEventQuickToggleField,
  useLoyaltyEventMutations,
} from "@/features/loyalty-events/hooks/use-loyalty-event-mutations";
import { useLoyaltyEventsList } from "@/features/loyalty-events/hooks/use-loyalty-events-list";
import { loyaltyEventsService } from "@/features/loyalty-events/services/loyalty-events.service";
import type { LoyaltyEvent } from "@/features/loyalty-events/types/loyalty-events.types";
import { AppBadge, AppButton, BilingualText } from "@/shared/components";
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
import { getLoyaltyDisplayName } from "@/shared/lib/loyalty/loyalty-translations.utils";

export function LoyaltyEventsPage() {
  const t = useTranslation();
  const guidance = useCrudPageGuidance("loyalty-events");
  const { canCreate, canUpdate, canDelete } = useCrudPermissions(
    PERMISSIONS.MANAGE_LOYALTY_EVENT,
  );
  const dialog = useCrudDialog<LoyaltyEvent>();
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
  } = useLoyaltyEventsList();

  const { bulkDelete, isBulkDeleting } = useCrudBulkDelete({
    bulkDeleteFn: (ids) => loyaltyEventsService.bulkDelete(ids),
    onSuccess: refetch,
  });

  const { tableSelectionProps, bulkDeleteDialogProps } = useCrudTableBulkActions({
    selection,
    canDelete,
    isDeleting: isBulkDeleting,
    onBulkDelete: bulkDelete,
  });

  const { deleteMutation, quickToggle, isDeleting } = useLoyaltyEventMutations({
    onSuccess: async () => {
      await refetch();
    },
  });

  const { handleToggle, isToggleLoading } = useCrudQuickToggle<LoyaltyEvent>({
    patchItems,
    toggle: (entity, field, value) =>
      quickToggle(entity, field as LoyaltyEventQuickToggleField, value),
  });

  const formMode = dialog.mode === "edit" ? "edit" : "create";
  const isFormOpen = dialog.mode === "create" || dialog.mode === "edit";

  const { data: eventDetail } = useCrudQuery({
    queryKey: ["loyalty-events", "detail", String(dialog.entity?.id ?? "")],
    queryFn: () => loyaltyEventsService.getById(dialog.entity!.id),
    enabled: dialog.mode === "view" && Boolean(dialog.entity?.id),
  });

  const viewingEvent = useMemo(() => {
    if (!dialog.entity || dialog.mode !== "view") return null;
    return eventDetail ?? items.find((item) => item.id === dialog.entity?.id) ?? dialog.entity;
  }, [dialog.entity, dialog.mode, eventDetail, items]);

  const rowActions = useCrudRowActions<LoyaltyEvent>({
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
        cell: (entity: LoyaltyEvent) => {
          const names = getLoyaltyDisplayName(entity.translations, entity.name);
          return (
            <CrudEntityNameCell
              placeholder="🪙"
              size="sm"
              onClick={() => dialog.openView(entity)}
              actions={
                <CrudTableActions entity={entity} actions={rowActions} ariaLabel={t.actions} />
              }
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  {names.en ? <AppBadge label={names.en} variant="brand" className="font-medium" /> : null}
                  {names.ar ? (
                    <span dir="rtl">
                      <AppBadge label={names.ar} variant="neutral" className="font-medium" />
                    </span>
                  ) : null}
                  {!names.en && !names.ar ? (
                    <BilingualText values={{ en: entity.code, ar: entity.code }} />
                  ) : null}
                </div>
                <p className="font-mono text-xs text-muted-foreground">{entity.code}</p>
              </div>
            </CrudEntityNameCell>
          );
        },
      },
      {
        id: "type",
        header: t.loyaltyEventType,
        cell: (entity: LoyaltyEvent) => entity.type?.label || entity.type?.value || t.notSet,
      },
      {
        id: "points",
        header: t.loyaltyEventPoints,
        cell: (entity: LoyaltyEvent) => entity.points,
      },
      {
        id: "status",
        header: t.status,
        className: "w-28 text-center",
        headerClassName: "text-center",
        cell: (entity: LoyaltyEvent) => (
          <CrudTableBooleanToggle
            entity={entity}
            field="isActive"
            checked={entity.isActive}
            canUpdate={canUpdate}
            isLoading={isToggleLoading(entity.id, "isActive")}
            ariaLabel={`${t.status}: ${entity.code}`}
            onToggle={(item, field, value) => void handleToggle(item, field, value)}
          />
        ),
      },
    ],
    [canUpdate, dialog, handleToggle, isToggleLoading, rowActions, t],
  );

  return (
    <CrudListPage
      {...guidance.pageProps}
      title={t.loyaltyEvents}
      actions={
        canCreate ? (
          <AppButton onClick={dialog.openCreate}>
            <Plus className="size-4" aria-hidden="true" />
            {t.addLoyaltyEvent}
          </AppButton>
        ) : undefined
      }
    >
      <CrudListSection>
        <CrudListTable
          tableId="loyalty-events"
          onExportCsv={exportCsv}
          isExportingCsv={isExportingCsv}
          guidanceAnchors={{
            search: guidance.searchDataGuidance,
            filters: guidance.filtersDataGuidance,
            rowActions: guidance.rowActionsDataGuidance,
          }}
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
          caption={t.loyaltyEvents}
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

      <LoyaltyEventViewDialog
        open={dialog.mode === "view"}
        event={viewingEvent}
        canUpdate={canUpdate}
        canDelete={canDelete}
        onOpenChange={(open) => {
          if (!open) dialog.close();
        }}
        onEdit={(entity) => dialog.openEdit(entity)}
        onDelete={(entity) => dialog.openDelete(entity)}
      />

      <LoyaltyEventFormDrawer
        open={isFormOpen}
        mode={formMode}
        event={dialog.entity}
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
        entityLabel={dialog.entity?.code}
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
