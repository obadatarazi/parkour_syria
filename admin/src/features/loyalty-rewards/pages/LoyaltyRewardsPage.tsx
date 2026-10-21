import { Plus } from "lucide-react";
import { useMemo } from "react";

import { useCrudPermissions } from "@/features/auth";
import { LoyaltyRewardFormDrawer } from "@/features/loyalty-rewards/components/LoyaltyRewardFormDrawer";
import { LoyaltyRewardViewDialog } from "@/features/loyalty-rewards/components/LoyaltyRewardViewDialog";
import {
  type LoyaltyRewardQuickToggleField,
  useLoyaltyRewardMutations,
} from "@/features/loyalty-rewards/hooks/use-loyalty-reward-mutations";
import { useLoyaltyRewardsList } from "@/features/loyalty-rewards/hooks/use-loyalty-rewards-list";
import { loyaltyRewardsService } from "@/features/loyalty-rewards/services/loyalty-rewards.service";
import type { LoyaltyReward } from "@/features/loyalty-rewards/types/loyalty-rewards.types";
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

function formatListRewardValue(reward: LoyaltyReward, notSet: string): string {
  if (reward.type?.value === "FREE_SHIPPING") return notSet;
  if (reward.rewardValue == null) return notSet;
  return String(reward.rewardValue);
}

export function LoyaltyRewardsPage() {
  const t = useTranslation();
  const guidance = useCrudPageGuidance("loyalty-rewards");
  const { canCreate, canUpdate, canDelete } = useCrudPermissions(
    PERMISSIONS.MANAGE_LOYALTY_REWARD,
  );
  const dialog = useCrudDialog<LoyaltyReward>();
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
  } = useLoyaltyRewardsList();

  const { bulkDelete, isBulkDeleting } = useCrudBulkDelete({
    bulkDeleteFn: (ids) => loyaltyRewardsService.bulkDelete(ids),
    onSuccess: refetch,
  });

  const { tableSelectionProps, bulkDeleteDialogProps } = useCrudTableBulkActions({
    selection,
    canDelete,
    isDeleting: isBulkDeleting,
    onBulkDelete: bulkDelete,
  });

  const { deleteMutation, quickToggle, isDeleting } = useLoyaltyRewardMutations({
    onSuccess: async () => {
      await refetch();
    },
  });

  const { handleToggle, isToggleLoading } = useCrudQuickToggle<LoyaltyReward>({
    patchItems,
    toggle: (entity, field, value) =>
      quickToggle(entity, field as LoyaltyRewardQuickToggleField, value),
  });

  const formMode = dialog.mode === "edit" ? "edit" : "create";
  const isFormOpen = dialog.mode === "create" || dialog.mode === "edit";

  const { data: rewardDetail } = useCrudQuery({
    queryKey: ["loyalty-rewards", "detail", String(dialog.entity?.id ?? "")],
    queryFn: () => loyaltyRewardsService.getById(dialog.entity!.id),
    enabled: dialog.mode === "view" && Boolean(dialog.entity?.id),
  });

  const viewingReward = useMemo(() => {
    if (!dialog.entity || dialog.mode !== "view") return null;
    return rewardDetail ?? items.find((item) => item.id === dialog.entity?.id) ?? dialog.entity;
  }, [dialog.entity, dialog.mode, rewardDetail, items]);

  const rowActions = useCrudRowActions<LoyaltyReward>({
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
        cell: (entity: LoyaltyReward) => {
          const names = getLoyaltyDisplayName(entity.translations, entity.name);
          return (
            <CrudEntityNameCell
              placeholder="🎁"
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
        header: t.loyaltyRewardType,
        cell: (entity: LoyaltyReward) => entity.type?.label || entity.type?.value || t.notSet,
      },
      {
        id: "pointsCost",
        header: t.loyaltyRewardPointsCost,
        cell: (entity: LoyaltyReward) => entity.pointsCost,
      },
      {
        id: "rewardValue",
        header: t.loyaltyRewardValue,
        cell: (entity: LoyaltyReward) => formatListRewardValue(entity, t.notSet),
      },
      {
        id: "status",
        header: t.status,
        className: "w-28 text-center",
        headerClassName: "text-center",
        cell: (entity: LoyaltyReward) => (
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
      title={t.loyaltyRewards}
      actions={
        canCreate ? (
          <AppButton onClick={dialog.openCreate}>
            <Plus className="size-4" aria-hidden="true" />
            {t.addLoyaltyReward}
          </AppButton>
        ) : undefined
      }
    >
      <CrudListSection>
        <CrudListTable
          tableId="loyalty-rewards"
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
          caption={t.loyaltyRewards}
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

      <LoyaltyRewardViewDialog
        open={dialog.mode === "view"}
        reward={viewingReward}
        canUpdate={canUpdate}
        canDelete={canDelete}
        onOpenChange={(open) => {
          if (!open) dialog.close();
        }}
        onEdit={(entity) => dialog.openEdit(entity)}
        onDelete={(entity) => dialog.openDelete(entity)}
      />

      <LoyaltyRewardFormDrawer
        open={isFormOpen}
        mode={formMode}
        reward={dialog.entity}
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
