import { useMemo } from "react";

import { useCrudPermissions } from "@/features/auth";
import { ContactUsFormDrawer } from "@/features/contact-us/components/ContactUsFormDrawer";
import { ContactUsViewDialog } from "@/features/contact-us/components/ContactUsViewDialog";
import { useContactUsList } from "@/features/contact-us/hooks/use-contact-us-list";
import { useContactUsMutations } from "@/features/contact-us/hooks/use-contact-us-mutations";
import { contactUsService } from "@/features/contact-us/services/contact-us.service";
import type { ContactUsMessage } from "@/features/contact-us/types/contact-us.types";
import { StatusBadge } from "@/shared/components";
import { PERMISSIONS } from "@/shared/constants/permissions";
import {
  CrudBulkDeleteDialog,
  CrudDeleteDialog,
  CrudEntityNameCell,
  CrudListPage,
  CrudListSection,
  CrudListTable,
  CrudTableActions,
  useCrudBulkDelete,
  useCrudDialog,
  useCrudRowActions,
  useCrudTableBulkActions,
} from "@/shared/crud";
import {
  useLocalization,
  useTranslation,
} from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { useCrudPageGuidance } from "@/shared/guidance";
import { formatDateTime } from "@/shared/lib/datetime.utils";

function resolveStatusVariant(
  status?: ContactUsMessage["status"],
): "warning" | "success" | "neutral" {
  if (status?.value === "PENDING") return "warning";
  if (status?.value === "REVIEWED") return "success";
  return "neutral";
}

export function ContactUsPage() {
  const t = useTranslation();
  const { language } = useLocalization();
  const guidance = useCrudPageGuidance("contact-us");
  const { canUpdate, canDelete } = useCrudPermissions(PERMISSIONS.MANAGE_CONTACT_US);
  const dialog = useCrudDialog<ContactUsMessage>();
  const {
    items: messages,
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
    filters,
    filterDefinitions,
    sort,
    setSort,
    sortDefinitions,
    selection,
    exportCsv,
    isExportingCsv,
  } = useContactUsList();

  const { bulkDelete, isBulkDeleting } = useCrudBulkDelete({
    bulkDeleteFn: (ids) => contactUsService.bulkDelete(ids),
    onSuccess: refetch,
  });

  const { tableSelectionProps, bulkDeleteDialogProps } = useCrudTableBulkActions({
    selection,
    canDelete,
    isDeleting: isBulkDeleting,
    onBulkDelete: bulkDelete,
  });

  const { deleteMutation, isDeleting } = useContactUsMutations({
    onSuccess: async () => {
      dialog.close();
      await refetch();
    },
  });

  const isFormOpen = dialog.mode === "edit";

  const rowActions = useCrudRowActions<ContactUsMessage>({
    dialog,
    canUpdate,
    canDelete,
    t,
    includeView: false,
  });

  const columns = useMemo(
    () => [
      {
        id: "userFullName",
        header: t.fullName,
        cell: (message: ContactUsMessage) => (
          <CrudEntityNameCell
            placeholder="✉️"
            size="sm"
            onClick={() => dialog.openView(message)}
            actions={
              <CrudTableActions entity={message} actions={rowActions} ariaLabel={t.actions} />
            }
          >
            <span className="font-medium">{message.userFullName}</span>
          </CrudEntityNameCell>
        ),
      },
      {
        id: "userEmail",
        header: t.email,
        cell: (message: ContactUsMessage) => message.userEmail,
      },
      {
        id: "message",
        header: t.message,
        className: "max-w-xs",
        cell: (message: ContactUsMessage) => (
          <span className="line-clamp-2 text-muted-foreground">{message.message}</span>
        ),
      },
      {
        id: "status",
        header: t.status,
        cell: (message: ContactUsMessage) => (
          <StatusBadge
            label={message.status?.label ?? t.notSet}
            variant={resolveStatusVariant(message.status)}
          />
        ),
      },
      {
        id: "createdAt",
        header: t.date,
        cell: (message: ContactUsMessage) => formatDateTime(message.createdAt, language),
      },
    ],
    [dialog, language, rowActions, t],
  );

  return (
    <CrudListPage {...guidance.pageProps} title={t.contactUs}>
      <CrudListSection>
        <CrudListTable
          guidanceAnchors={{
            search: guidance.searchDataGuidance,
            filters: guidance.filtersDataGuidance,
            rowActions: guidance.rowActionsDataGuidance,
          }}
          tableId="contact-us"
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
          data={messages}
          isLoading={isLoading}
          isError={isError}
          errorTitle={t.errorStateDefaultTitle}
          errorDescription={resolveServiceErrorMessage(error, t)}
          retryLabel={t.tryAgain}
          onRetry={() => void refetch()}
          emptyTitle={t.noData}
          emptyDescription={t.emptyStateDefaultDescription}
          caption={t.contactUs}
          showingLabel={`${t.showing} ${messages.length} ${t.of} ${total} ${t.results}`}
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

      <ContactUsViewDialog
        open={dialog.mode === "view"}
        message={dialog.entity}
        canDelete={canDelete}
        onOpenChange={(open) => {
          if (!open) dialog.close();
        }}
        onDelete={(message) => dialog.openDelete(message)}
      />

      <ContactUsFormDrawer
        open={isFormOpen}
        message={dialog.entity}
        canUpdate={canUpdate}
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
        entityLabel={dialog.entity?.userFullName}
        isLoading={isDeleting}
        onConfirm={() => {
          if (dialog.entity) void deleteMutation.mutate(dialog.entity);
        }}
      />
    </CrudListPage>
  );
}
