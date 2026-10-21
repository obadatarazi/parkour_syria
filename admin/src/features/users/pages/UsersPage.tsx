import { Plus } from "lucide-react";
import { useMemo } from "react";

import { useCrudPermissions } from "@/features/auth";
import { UserFormDrawer } from "@/features/users/components/UserFormDrawer";
import { UserViewDialog } from "@/features/users/components/UserViewDialog";
import {
  type UserQuickToggleField,
  useUserMutations,
} from "@/features/users/hooks/use-user-mutations";
import { useUsersList } from "@/features/users/hooks/use-users-list";
import { usersService } from "@/features/users/services/users.service";
import { type AdminUser,getUserDisplayName } from "@/features/users/types/users.types";
import { AppButton, PhoneNumberText, UserAvatar, UserLabelText } from "@/shared/components";
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

export function UsersPage() {
  const t = useTranslation();
  const guidance = useCrudPageGuidance("users");
  const { canCreate, canUpdate, canDelete } = useCrudPermissions(PERMISSIONS.MANAGE_USER);
  const dialog = useCrudDialog<AdminUser>();
  const {
    items: users,
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
    selection,
    exportCsv,
    isExportingCsv,
  } = useUsersList({ fixedType: "ADMIN" });

  const { bulkDelete, isBulkDeleting } = useCrudBulkDelete({
    bulkDeleteFn: (ids) => usersService.bulkDelete(ids),
    onSuccess: refetch,
  });

  const { tableSelectionProps, bulkDeleteDialogProps } = useCrudTableBulkActions({
    selection,
    canDelete,
    isDeleting: isBulkDeleting,
    onBulkDelete: bulkDelete,
  });

  const { deleteMutation, quickToggle, isDeleting } = useUserMutations({
    onSuccess: async () => {
      dialog.close();
      await refetch();
    },
  });
  const { handleToggle, isToggleLoading } = useCrudQuickToggle<AdminUser>({
    patchItems,
    toggle: (entity, field, value) =>
      quickToggle(entity, field as UserQuickToggleField, value),
  });

  const formMode = dialog.mode === "edit" ? "edit" : "create";
  const isFormOpen = dialog.mode === "create" || dialog.mode === "edit";

  // List is slim (no gender). View loads Details via getById — same pattern as Orders.
  const { data: userDetail } = useCrudQuery({
    queryKey: ["users", "detail", String(dialog.entity?.id ?? "")],
    queryFn: () => usersService.getById(dialog.entity!.id),
    enabled: dialog.mode === "view" && Boolean(dialog.entity?.id),
  });

  const viewingUser = useMemo(() => {
    if (!dialog.entity || dialog.mode !== "view") return null;
    return (
      userDetail ??
      users.find((user) => user.id === dialog.entity?.id) ??
      dialog.entity
    );
  }, [dialog.entity, dialog.mode, userDetail, users]);

  const rowActions = useCrudRowActions<AdminUser>({
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
        cell: (user: AdminUser) => {
          const displayName = getUserDisplayName(user);
          return (
            <CrudEntityNameCell
              imageUrl={user.avatarFileUrl}
              imageAlt={displayName}
              placeholder={<UserAvatar name={displayName} size="sm" />}
              size="sm"
              onClick={() => dialog.openView(user)}
              actions={
                <CrudTableActions entity={user} actions={rowActions} ariaLabel={t.actions} />
              }
            >
              <UserLabelText value={displayName} className="font-semibold text-foreground" />
            </CrudEntityNameCell>
          );
        },
      },
      {
        id: "email",
        header: t.email,
        cell: (user: AdminUser) => user.email ?? "—",
      },
      {
        id: "phone",
        header: t.phone,
        cell: (user: AdminUser) => (
          <PhoneNumberText value={user.phoneNumber} />
        ),
      },
      {
        id: "type",
        header: t.userType,
        cell: (user: AdminUser) => user.type?.label ?? "—",
      },
      {
        id: "roles",
        header: t.roles,
        cell: (user: AdminUser) =>
          user.roles?.length ? user.roles.map((role) => role.name).join(", ") : "—",
      },
      {
        id: "status",
        header: t.status,
        className: "w-28 text-center",
        headerClassName: "text-center",
        cell: (user: AdminUser) => (
          <CrudTableBooleanToggle
            entity={user}
            field="active"
            checked={user.active ?? false}
            canUpdate={canUpdate}
            isLoading={isToggleLoading(user.id, "active")}
            ariaLabel={`${t.status}: ${getUserDisplayName(user)}`}
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
      title={t.users}
      actions={
        canCreate ? (
          <AppButton onClick={dialog.openCreate}>
            <Plus className="size-4" aria-hidden="true" />
            {t.addUser}
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
          tableId="users"
          onExportCsv={exportCsv}
          isExportingCsv={isExportingCsv}
          search={{
            value: search,
            onChange: setSearch,
            onReset: resetSearch,
            placeholder: t.searchUsers,
          }}
          filters={{
            definitions: filterDefinitions,
            values: filters.values,
            onChange: filters.setFilter,
            onReset: filters.resetFilters,
            hasActiveFilters: filters.hasActiveFilters,
          }}
          {...tableSelectionProps}
          columns={columns}
          data={users}
          isLoading={isLoading}
          isError={isError}
          errorTitle={t.errorStateDefaultTitle}
          errorDescription={resolveServiceErrorMessage(error, t)}
          retryLabel={t.tryAgain}
          onRetry={() => void refetch()}
          emptyTitle={t.noData}
          emptyDescription={t.emptyStateDefaultDescription}
          caption={t.users}
          showingLabel={`${t.showing} ${users.length} ${t.of} ${total} ${t.results}`}
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

      <UserViewDialog
        open={dialog.mode === "view"}
        user={viewingUser}
        canUpdate={canUpdate}
        canDelete={canDelete}
        onOpenChange={(open) => {
          if (!open) dialog.close();
        }}
        onEdit={(user) => dialog.openEdit(user)}
        onDelete={(user) => dialog.openDelete(user)}
      />

      <UserFormDrawer
        open={isFormOpen}
        mode={formMode}
        user={dialog.entity}
        fixedType="ADMIN"
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
        entityLabel={dialog.entity ? getUserDisplayName(dialog.entity) : undefined}
        isLoading={isDeleting}
        onConfirm={() => {
          if (dialog.entity) void deleteMutation.mutate(dialog.entity);
        }}
      />
    </CrudListPage>
  );
}
