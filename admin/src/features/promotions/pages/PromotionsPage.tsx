import { Copy, Eye, Gift, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router";

import { promotionEditPath, promotionViewPath, ROUTES } from "@/app/router/routes";
import { useCrudPermissions } from "@/features/auth";
import { formatKwd } from "@/features/products/utils/product-display.utils";
import { usePromotionMutations } from "@/features/promotions/hooks/use-promotion-mutations";
import { usePromotionsList } from "@/features/promotions/hooks/use-promotions-list";
import { promotionsService } from "@/features/promotions/services/promotions.service";
import type { Promotion } from "@/features/promotions/types/promotions.types";
import { AppButton, BilingualText, StatusBadge } from "@/shared/components";
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
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { useCrudPageGuidance } from "@/shared/guidance";
import { formatDateTime } from "@/shared/lib/datetime.utils";
import { notify } from "@/shared/lib/notifications";
import {
  formatBilingualLabel,
  getBilingualTitle,
} from "@/shared/lib/translation-display.utils";

export function PromotionsPage() {
  const t = useTranslation();
  const navigate = useNavigate();
  const guidance = useCrudPageGuidance("promotions");
  const { canCreate, canUpdate, canDelete } = useCrudPermissions(PERMISSIONS.MANAGE_PROMOTION);
  const dialog = useCrudDialog<Promotion>();
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
    filters,
    filterDefinitions,
    sort,
    setSort,
    sortDefinitions,
    selection,
    exportCsv,
    isExportingCsv,
  } = usePromotionsList();

  const { bulkDelete, isBulkDeleting } = useCrudBulkDelete({
    bulkDeleteFn: (ids) => promotionsService.bulkDelete(ids),
    onSuccess: refetch,
  });

  const { tableSelectionProps, bulkDeleteDialogProps } = useCrudTableBulkActions({
    selection,
    canDelete,
    isDeleting: isBulkDeleting,
    onBulkDelete: bulkDelete,
  });

  const { deleteMutation, isDeleting } = usePromotionMutations({
    onSuccess: async () => {
      dialog.close();
      await refetch();
    },
  });

  const openViewer = useCallback(
    (entity: Promotion) => {
      navigate(promotionViewPath(entity));
    },
    [navigate],
  );

  const openEditor = useCallback(
    (entity: Promotion) => {
      navigate(promotionEditPath(entity));
    },
    [navigate],
  );

  const copyCode = useCallback(
    async (code: string) => {
      try {
        await navigator.clipboard.writeText(code);
        notify.success(t.promotionCodeCopied);
      } catch {
        notify.error(t.errorMessage);
      }
    },
    [t],
  );

  const rowActions = useMemo((): CrudRowAction<Promotion>[] => {
    const actions: CrudRowAction<Promotion>[] = [
      {
        id: "view",
        label: t.viewAction,
        icon: Eye,
        onSelect: openViewer,
      },
    ];
    if (canUpdate) {
      actions.push({
        id: "edit",
        label: t.editAction,
        icon: Pencil,
        onSelect: openEditor,
      });
    }
    if (canDelete) {
      actions.push({
        id: "delete",
        label: t.deleteAction,
        icon: Trash2,
        variant: "destructive",
        onSelect: (entity) => dialog.openDelete(entity),
      });
    }
    return actions;
  }, [canDelete, canUpdate, dialog, openEditor, openViewer, t]);

  const columns = useMemo(
    () => [
      {
        id: "code",
        hideable: false,
        header: t.promotionCode,
        cell: (entity: Promotion) => {
          const title = getBilingualTitle(entity.translations, entity.name ?? entity.code);
          return (
            <CrudEntityNameCell
              placeholder={
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Gift className="size-4" aria-hidden="true" />
                </span>
              }
              size="sm"
              actions={
                <CrudTableActions entity={entity} actions={rowActions} ariaLabel={t.actions} />
              }
            >
              <div className="min-w-0 space-y-0.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    className="min-w-0 text-start font-semibold tracking-wide transition-colors hover:text-primary"
                    onClick={() => openViewer(entity)}
                  >
                    {entity.code}
                  </button>
                  <button
                    type="button"
                    className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                    onClick={() => {
                      void copyCode(entity.code);
                    }}
                    aria-label={t.copyCode}
                  >
                    <Copy className="size-3.5" />
                  </button>
                </div>
                <BilingualText values={title} className="text-xs text-muted-foreground" />
              </div>
            </CrudEntityNameCell>
          );
        },
      },
      {
        id: "type",
        header: t.bogoPromotionType,
        cell: (entity: Promotion) => entity.type?.label || entity.type?.value || t.notSet,
      },
      {
        id: "status",
        header: t.status,
        cell: (entity: Promotion) => (
          <StatusBadge
            label={entity.isActive ? t.active : t.inactive}
            variant={entity.isActive ? "success" : "neutral"}
          />
        ),
      },
      {
        id: "priority",
        header: t.promotionPriority,
        cell: (entity: Promotion) => entity.priority,
      },
      {
        id: "usage",
        header: t.promotionUsageSection,
        cell: (entity: Promotion) => {
          const used = entity.usageSummary?.usedCount ?? 0;
          const remaining = entity.usageSummary?.remaining;
          const limit = entity.usageSummary?.usageLimit ?? entity.usageLimit;
          return (
            <div className="space-y-0.5 text-xs">
              <p className="font-medium text-foreground">
                {used}
                {limit != null ? ` / ${limit}` : ""}
              </p>
              <p className="text-muted-foreground">
                {remaining == null
                  ? t.couponUsageUnlimited
                  : `${t.promotionRemaining}: ${remaining}`}
              </p>
              <p className="text-muted-foreground">
                {formatKwd(entity.usageSummary?.totalGivenAway ?? 0)}
              </p>
            </div>
          );
        },
      },
      {
        id: "window",
        header: t.promotionScheduleSection,
        cell: (entity: Promotion) => {
          if (entity.isLifetime || (!entity.startsAt && !entity.endsAt)) {
            return <span className="text-xs text-muted-foreground">{t.promotionLifetime}</span>;
          }
          const start = entity.startsAt ? formatDateTime(entity.startsAt) : "—";
          const end = entity.endsAt ? formatDateTime(entity.endsAt) : "—";
          return (
            <span className="text-xs text-muted-foreground">
              {start} → {end}
            </span>
          );
        },
      },
    ],
    [copyCode, openViewer, rowActions, t],
  );

  return (
    <CrudListPage
      {...guidance.pageProps}
      title={t.promotions}
      actions={
        canCreate ? (
          <AppButton onClick={() => navigate(ROUTES.admin.promotionNew)}>
            <Plus className="size-4" aria-hidden="true" />
            {t.addPromotion}
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
          tableId="promotions"
          onExportCsv={exportCsv}
          isExportingCsv={isExportingCsv}
          search={{
            value: search,
            onChange: setSearch,
            onReset: resetSearch,
            placeholder: t.searchPromotions,
          }}
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
          emptyDescription={t.promotionsEmptyDescription}
          caption={t.promotions}
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

      <CrudBulkDeleteDialog {...bulkDeleteDialogProps} />

      <CrudDeleteDialog
        open={dialog.mode === "delete"}
        onOpenChange={(open) => {
          if (!open) dialog.close();
        }}
        entityLabel={
          dialog.entity
            ? formatBilingualLabel(
                getBilingualTitle(
                  dialog.entity.translations,
                  dialog.entity.name ?? dialog.entity.code,
                ),
              )
            : undefined
        }
        isLoading={isDeleting}
        onConfirm={() => {
          if (dialog.entity) void deleteMutation.mutate(dialog.entity);
        }}
      />
    </CrudListPage>
  );
}
