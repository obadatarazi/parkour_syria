import { Plus } from "lucide-react";
import { useMemo } from "react";

import { useCrudPermissions } from "@/features/auth";
import { EventFormDrawer } from "@/features/events/components/EventFormDrawer";
import { EventViewDialog } from "@/features/events/components/EventViewDialog";
import { useEventMutations } from "@/features/events/hooks/use-event-mutations";
import { useEventsList } from "@/features/events/hooks/use-events-list";
import { eventsService } from "@/features/events/services/events.service";
import { isPastEvent, type ParkourEvent } from "@/features/events/types/events.types";
import { eventTypeLabel, formatEventDateTime } from "@/features/events/utils/event-labels";
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
import {
  useLocalization,
  useTranslation,
} from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { getBilingualField, pickLocaleText } from "@/shared/lib/api/locale-fields.utils";

export function EventsPage() {
  const t = useTranslation();
  const { language } = useLocalization();
  const { canCreate, canUpdate, canDelete } = useCrudPermissions(PERMISSIONS.MANAGE_EVENT);
  const dialog = useCrudDialog<ParkourEvent>();
  const list = useEventsList();

  const { bulkDelete, isBulkDeleting } = useCrudBulkDelete({
    bulkDeleteFn: (ids) => eventsService.bulkDelete(ids),
    onSuccess: list.refetch,
  });
  const { tableSelectionProps, bulkDeleteDialogProps } = useCrudTableBulkActions({
    selection: list.selection,
    canDelete,
    isDeleting: isBulkDeleting,
    onBulkDelete: bulkDelete,
  });

  const { deleteMutation, quickToggle, isDeleting } = useEventMutations({
    onSuccess: async () => {
      dialog.close();
      await list.refetch();
    },
  });
  const { handleToggle, isToggleLoading } = useCrudQuickToggle<ParkourEvent>({
    patchItems: list.patchItems,
    toggle: quickToggle,
  });

  const rowActions = useCrudRowActions<ParkourEvent>({ dialog, canUpdate, canDelete, t });

  const columns = useMemo(
    () => [
      {
        id: "title",
        hideable: false,
        header: t.fieldTitle,
        cell: (event: ParkourEvent) => (
          <CrudEntityNameCell
            imageUrl={event.imageFileUrl}
            placeholder="📅"
            size="md"
            onClick={() => dialog.openView(event)}
            actions={<CrudTableActions entity={event} actions={rowActions} ariaLabel={t.actions} />}
          >
            <BilingualText values={getBilingualField(event.translations, "title", event.title)} />
          </CrudEntityNameCell>
        ),
      },
      {
        id: "startsAt",
        header: t.fieldStartsAt,
        className: "w-48",
        cell: (event: ParkourEvent) => {
          const past = isPastEvent(event);
          return (
            <div className="space-y-1">
              <p className="text-sm text-foreground">{formatEventDateTime(event.startsAt, language)}</p>
              <StatusBadge
                label={past ? t.eventPast : t.eventUpcoming}
                variant={past ? "neutral" : "success"}
              />
            </div>
          );
        },
      },
      {
        id: "type",
        header: t.eventType,
        className: "w-28",
        cell: (event: ParkourEvent) => (
          <StatusBadge label={eventTypeLabel(t, event.type)} variant="info" />
        ),
      },
      {
        id: "area",
        header: t.fieldArea,
        cell: (event: ParkourEvent) =>
          event.area?.name || <span className="text-muted-foreground">—</span>,
      },
      {
        id: "publish",
        header: t.publish,
        className: "w-28 text-center",
        headerClassName: "text-center",
        cell: (event: ParkourEvent) => (
          <CrudTableBooleanToggle
            entity={event}
            field="publish"
            checked={event.publish}
            canUpdate={canUpdate}
            isLoading={isToggleLoading(event.id, "publish")}
            ariaLabel={`${t.publish}: ${pickLocaleText(event.translations, "title", event.title)}`}
            onToggle={(entity, field, value) => void handleToggle(entity, field, value)}
          />
        ),
      },
    ],
    [canUpdate, dialog, handleToggle, isToggleLoading, language, rowActions, t],
  );

  return (
    <CrudListPage
      title={t.navEvents}
      actions={
        canCreate ? (
          <AppButton onClick={dialog.openCreate}>
            <Plus className="size-4" aria-hidden="true" />
            {t.addEvent}
          </AppButton>
        ) : undefined
      }
    >
      <CrudListSection>
        <CrudListTable
          tableId="events"
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
          caption={t.navEvents}
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

      <EventViewDialog
        open={dialog.mode === "view"}
        event={dialog.entity}
        canUpdate={canUpdate}
        canDelete={canDelete}
        onOpenChange={(open) => !open && dialog.close()}
        onEdit={dialog.openEdit}
        onDelete={dialog.openDelete}
      />

      <EventFormDrawer
        open={dialog.mode === "create" || dialog.mode === "edit"}
        mode={dialog.mode === "edit" ? "edit" : "create"}
        event={dialog.entity}
        onOpenChange={(open) => !open && dialog.close()}
        onSuccess={list.refetch}
      />

      <CrudBulkDeleteDialog {...bulkDeleteDialogProps} />

      <CrudDeleteDialog
        open={dialog.mode === "delete"}
        onOpenChange={(open) => !open && dialog.close()}
        entityLabel={dialog.entity ? pickLocaleText(dialog.entity.translations, "title", dialog.entity.title) : undefined}
        isLoading={isDeleting}
        onConfirm={() => {
          if (dialog.entity) void deleteMutation.mutate(dialog.entity);
        }}
      />
    </CrudListPage>
  );
}
