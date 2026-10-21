import { Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo } from "react";

import { useCrudPermissions } from "@/features/auth";
import { RoleFormDrawer } from "@/features/roles/components/RoleFormDrawer";
import { useRoleMutations } from "@/features/roles/hooks/use-role-mutations";
import { useRolesList } from "@/features/roles/hooks/use-roles-list";
import { rolesService } from "@/features/roles/services/roles.service";
import type { Role } from "@/features/roles/types/roles.types";
import { isProtectedRole } from "@/features/roles/utils/is-protected-role";
import { roleDisplayName } from "@/features/roles/utils/role-label";
import { AppButton, StatusBadge } from "@/shared/components";
import { PERMISSIONS } from "@/shared/constants/permissions";
import {
  CrudBulkDeleteDialog,
  CrudDeleteDialog,
  CrudListPage,
  CrudListSection,
  CrudListTable,
  CrudTableActions,
  useCrudBulkDelete,
  useCrudDialog,
  useCrudTableBulkActions,
} from "@/shared/crud";
import type { CrudRowAction } from "@/shared/crud/types/crud.types";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { useCrudPageGuidance } from "@/shared/guidance";

export function RolesPage() {
  const t = useTranslation();
  const guidance = useCrudPageGuidance("roles");
  const { canCreate, canUpdate, canDelete } = useCrudPermissions(PERMISSIONS.MANAGE_ROLE);
  const dialog = useCrudDialog<Role>();
  const {
    items: roles,
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
    sort,
    setSort,
    sortDefinitions,
    selection,
    exportCsv,
    isExportingCsv,
  } = useRolesList();

  const { bulkDelete, isBulkDeleting } = useCrudBulkDelete({
    bulkDeleteFn: (ids) => rolesService.bulkDelete(ids),
    onSuccess: refetch,
  });

  const { tableSelectionProps, bulkDeleteDialogProps } = useCrudTableBulkActions({
    selection,
    canDelete,
    isDeleting: isBulkDeleting,
    onBulkDelete: async (ids) => {
      const deletableIds = roles
        .filter((role) => ids.includes(role.id) && !isProtectedRole(role))
        .map((role) => role.id);
      if (deletableIds.length === 0) return;
      return bulkDelete(deletableIds);
    },
  });

  const { deleteMutation, isDeleting } = useRoleMutations({
    onSuccess: async () => {
      dialog.close();
      await refetch();
    },
  });

  const formMode = dialog.mode === "edit" ? "edit" : "create";
  const isEditingProtectedRole =
    dialog.mode === "edit" && dialog.entity != null && isProtectedRole(dialog.entity);
  const isFormOpen =
    dialog.mode === "create" || (dialog.mode === "edit" && !isEditingProtectedRole);

  const getRowActions = (role: Role): CrudRowAction<Role>[] => {
    const actions: CrudRowAction<Role>[] = [];
    const protectedRole = isProtectedRole(role);

    if (canUpdate && !protectedRole) {
      actions.push({
        id: "edit",
        label: t.editAction,
        icon: Pencil,
        onSelect: (entity) => {
          if (isProtectedRole(entity)) return;
          dialog.openEdit(entity);
        },
      });
    }

    if (canDelete && !protectedRole) {
      actions.push({
        id: "delete",
        label: t.deleteAction,
        icon: Trash2,
        variant: "destructive",
        onSelect: (entity) => {
          if (isProtectedRole(entity)) return;
          dialog.openDelete(entity);
        },
      });
    }

    return actions;
  };

  const columns = useMemo(
    () => [
      {
        id: "name",
        hideable: false,
        header: t.name,
        cell: (role: Role) => (
          <span className="font-semibold text-foreground">{roleDisplayName(t, role)}</span>
        ),
      },
      {
        id: "type",
        header: t.roleType,
        cell: (role: Role) => (
          <StatusBadge
            label={role.standard ? t.standardRole : t.customRole}
            variant={role.standard ? "neutral" : "info"}
          />
        ),
      },
      {
        id: "permissions",
        header: t.permissions,
        className: "max-w-md",
        cell: (role: Role) => {
          const count = role.permissionsCount ?? role.permissions?.length;
          return (
            <span className="text-muted-foreground">
              {count != null && count > 0
                ? t.permissionCount.replace("{count}", String(count))
                : "—"}
            </span>
          );
        },
      },
    ],
    [t],
  );

  return (
    <CrudListPage
      {...guidance.pageProps}
      title={t.userRoles}
      actions={
        canCreate ? (
          <AppButton onClick={dialog.openCreate}>
            <Plus className="size-4" aria-hidden="true" />
            {t.addRole}
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
          tableId="roles"
          onExportCsv={exportCsv}
          isExportingCsv={isExportingCsv}
          search={{ value: search, onChange: setSearch, onReset: resetSearch }}
          sort={{ definitions: sortDefinitions, value: sort, onChange: setSort }}
          {...tableSelectionProps}
          columns={columns}
          data={roles}
          isLoading={isLoading}
          isError={isError}
          errorTitle={t.errorStateDefaultTitle}
          errorDescription={resolveServiceErrorMessage(error, t)}
          retryLabel={t.tryAgain}
          onRetry={() => void refetch()}
          emptyTitle={t.noData}
          emptyDescription={t.emptyStateDefaultDescription}
          rowActions={
            canUpdate || canDelete
              ? (role) => {
                  const actions = getRowActions(role);
                  if (actions.length === 0) return null;
                  return (
                    <CrudTableActions entity={role} actions={actions} ariaLabel={t.actions} />
                  );
                }
              : undefined
          }
          actionsHeader={canUpdate || canDelete ? t.actions : undefined}
          caption={t.userRoles}
          showingLabel={`${t.showing} ${roles.length} ${t.of} ${total} ${t.results}`}
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

      <RoleFormDrawer
        open={isFormOpen}
        mode={formMode}
        role={dialog.entity}
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
        entityLabel={dialog.entity?.name}
        isLoading={isDeleting}
        onConfirm={() => {
          if (!dialog.entity || isProtectedRole(dialog.entity)) return;
          void deleteMutation.mutate(dialog.entity);
        }}
      />
    </CrudListPage>
  );
}
