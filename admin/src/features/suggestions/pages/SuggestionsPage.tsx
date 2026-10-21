import { Check, Eye, Pencil, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";

import { useCrudPermissions } from "@/features/auth";
import { formatEventDateTime } from "@/features/events/utils/event-labels";
import { SuggestionFormDrawer } from "@/features/suggestions/components/SuggestionFormDrawer";
import {
  SuggestionAcceptDialog,
  SuggestionRejectDialog,
} from "@/features/suggestions/components/SuggestionReviewDialogs";
import { SuggestionViewDialog } from "@/features/suggestions/components/SuggestionViewDialog";
import { useSuggestionMutations } from "@/features/suggestions/hooks/use-suggestion-mutations";
import { useSuggestionsList } from "@/features/suggestions/hooks/use-suggestions-list";
import { suggestionsService } from "@/features/suggestions/services/suggestions.service";
import {
  type Suggestion,
  suggestionStatusLabel,
  suggestionStatusVariant,
  suggestionTypeLabel,
} from "@/features/suggestions/types/suggestions.types";
import { StatusBadge } from "@/shared/components";
import { PERMISSIONS } from "@/shared/constants/permissions";
import {
  CrudBulkDeleteDialog,
  CrudDeleteDialog,
  CrudEntityNameCell,
  CrudListPage,
  CrudListSection,
  CrudListTable,
  type CrudRowAction,
  CrudTableActions,
  useCrudBulkDelete,
  useCrudDialog,
  useCrudTableBulkActions,
} from "@/shared/crud";
import {
  useLocalization,
  useTranslation,
} from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";

/** The moderation queue for what visitors send through the public suggest form. */
export function SuggestionsPage() {
  const t = useTranslation();
  const { language } = useLocalization();
  const { canUpdate, canDelete } = useCrudPermissions(PERMISSIONS.MANAGE_SUGGESTION);
  const dialog = useCrudDialog<Suggestion>();
  const list = useSuggestionsList();
  const [accepting, setAccepting] = useState<Suggestion | null>(null);
  const [rejecting, setRejecting] = useState<Suggestion | null>(null);

  const { bulkDelete, isBulkDeleting } = useCrudBulkDelete({
    bulkDeleteFn: (ids) => suggestionsService.bulkDelete(ids),
    onSuccess: list.refetch,
  });
  const { tableSelectionProps, bulkDeleteDialogProps } = useCrudTableBulkActions({
    selection: list.selection,
    canDelete,
    isDeleting: isBulkDeleting,
    onBulkDelete: bulkDelete,
  });

  const { deleteMutation, acceptMutation, rejectMutation, isDeleting, isReviewing } =
    useSuggestionMutations({
      onSuccess: async () => {
        dialog.close();
        setAccepting(null);
        setRejecting(null);
        await list.refetch();
      },
    });

  // Accept / reject / edit only apply to a pending suggestion, the name cell drops them otherwise.
  const rowActions = useMemo<CrudRowAction<Suggestion>[]>(() => {
    return [
      { id: "view", label: t.viewAction, icon: Eye, onSelect: dialog.openView },
      ...(canUpdate
        ? [
            { id: "accept", label: t.acceptAction, icon: Check, onSelect: setAccepting },
            { id: "reject", label: t.rejectAction, icon: X, onSelect: setRejecting },
            { id: "edit", label: t.editAction, icon: Pencil, onSelect: dialog.openEdit },
          ]
        : []),
      ...(canDelete
        ? [
            {
              id: "delete",
              label: t.deleteAction,
              icon: Trash2,
              variant: "destructive" as const,
              onSelect: dialog.openDelete,
            },
          ]
        : []),
    ];
  }, [canDelete, canUpdate, dialog.openDelete, dialog.openEdit, dialog.openView, t]);

  const columns = useMemo(
    () => [
      {
        id: "name",
        hideable: false,
        header: t.fieldName,
        cell: (suggestion: Suggestion) => (
          <CrudEntityNameCell
            placeholder="💡"
            onClick={() => dialog.openView(suggestion)}
            actions={
              <CrudTableActions
                entity={suggestion}
                actions={rowActions.filter(
                  (action) =>
                    suggestion.status === "pending" ||
                    !["accept", "reject", "edit"].includes(action.id),
                )}
                ariaLabel={t.actions}
              />
            }
          >
            <span className="font-semibold text-foreground">{suggestion.name || "—"}</span>
          </CrudEntityNameCell>
        ),
      },
      {
        id: "type",
        header: t.suggestionType,
        className: "w-28",
        cell: (suggestion: Suggestion) => (
          <StatusBadge label={suggestionTypeLabel(t, suggestion.type)} variant="info" />
        ),
      },
      {
        id: "area",
        header: t.fieldArea,
        cell: (suggestion: Suggestion) =>
          suggestion.area?.name || <span className="text-muted-foreground">—</span>,
      },
      {
        id: "proposer",
        header: t.suggestionProposer,
        cell: (suggestion: Suggestion) =>
          suggestion.proposerName || <span className="text-muted-foreground">—</span>,
      },
      {
        id: "createdAt",
        header: t.createdAt,
        className: "w-44",
        cell: (suggestion: Suggestion) =>
          suggestion.createdAt ? (
            <span className="text-sm">{formatEventDateTime(suggestion.createdAt, language)}</span>
          ) : (
            "—"
          ),
      },
      {
        id: "status",
        header: t.suggestionStatus,
        className: "w-36",
        cell: (suggestion: Suggestion) => (
          <StatusBadge
            label={suggestionStatusLabel(t, suggestion.status)}
            variant={suggestionStatusVariant(suggestion.status)}
          />
        ),
      },
    ],
    [dialog, language, rowActions, t],
  );

  return (
    <CrudListPage title={t.navSuggestions}>
      <CrudListSection>
        <CrudListTable
          tableId="suggestions"
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
          caption={t.navSuggestions}
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

      <SuggestionViewDialog
        open={dialog.mode === "view"}
        suggestion={dialog.entity}
        canUpdate={canUpdate}
        canDelete={canDelete}
        onOpenChange={(open) => !open && dialog.close()}
        onEdit={dialog.openEdit}
        onDelete={dialog.openDelete}
        onAccept={setAccepting}
        onReject={setRejecting}
      />

      <SuggestionFormDrawer
        open={dialog.mode === "edit"}
        suggestion={dialog.entity}
        onOpenChange={(open) => !open && dialog.close()}
        onSuccess={list.refetch}
      />

      <SuggestionAcceptDialog
        suggestion={accepting}
        isLoading={isReviewing}
        onOpenChange={(open) => !open && setAccepting(null)}
        onConfirm={(data) => {
          if (accepting) void acceptMutation.mutate({ suggestion: accepting, data });
        }}
      />

      <SuggestionRejectDialog
        suggestion={rejecting}
        isLoading={isReviewing}
        onOpenChange={(open) => !open && setRejecting(null)}
        onConfirm={(reason) => {
          if (rejecting) void rejectMutation.mutate({ suggestion: rejecting, reason });
        }}
      />

      <CrudBulkDeleteDialog {...bulkDeleteDialogProps} />

      <CrudDeleteDialog
        open={dialog.mode === "delete"}
        onOpenChange={(open) => !open && dialog.close()}
        entityLabel={dialog.entity?.name ?? undefined}
        isLoading={isDeleting}
        onConfirm={() => {
          if (dialog.entity) void deleteMutation.mutate(dialog.entity);
        }}
      />
    </CrudListPage>
  );
}
