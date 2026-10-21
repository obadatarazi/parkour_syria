import { Copy, Eye, Pencil, Plus, TicketPercent, Trash2 } from "lucide-react";
import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router";

import { couponEditPath, couponViewPath, ROUTES } from "@/app/router/routes";
import { useCrudPermissions } from "@/features/auth";
import { useCouponMutations } from "@/features/coupons/hooks/use-coupon-mutations";
import { useCouponsList } from "@/features/coupons/hooks/use-coupons-list";
import { useOpenCouponFromUrl } from "@/features/coupons/hooks/use-open-coupon-from-url";
import { couponsService } from "@/features/coupons/services/coupons.service";
import type { Coupon } from "@/features/coupons/types/coupons.types";
import { formatKwd } from "@/features/products/utils/product-display.utils";
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

function statusVariant(
  value?: string | null,
): "success" | "warning" | "danger" | "info" | "neutral" {
  switch (value) {
    case "ACTIVE":
      return "success";
    case "DRAFT":
      return "info";
    case "IN_ACTIVE":
      return "neutral";
    case "EXPIRED":
    case "REACH_THE_LIMIT":
      return "danger";
    default:
      return "warning";
  }
}

function formatCouponValue(coupon: Coupon): string {
  if (coupon.type?.value === "FREE_SHIPPING") return "—";
  if (!coupon.value) return "—";
  if (coupon.type?.value === "PERCENTAGE") return `${coupon.value}%`;
  const amount = Number(coupon.value);
  return Number.isFinite(amount) ? formatKwd(amount) : coupon.value;
}

export function CouponsPage() {
  const t = useTranslation();
  const navigate = useNavigate();
  const guidance = useCrudPageGuidance("coupons");
  const { canCreate, canUpdate, canDelete } = useCrudPermissions(PERMISSIONS.MANAGE_COUPON);
  const dialog = useCrudDialog<Coupon>();
  useOpenCouponFromUrl();
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
  } = useCouponsList();

  const { bulkDelete, isBulkDeleting } = useCrudBulkDelete({
    bulkDeleteFn: (ids) => couponsService.bulkDelete(ids),
    onSuccess: refetch,
  });

  const { tableSelectionProps, bulkDeleteDialogProps } = useCrudTableBulkActions({
    selection,
    canDelete,
    isDeleting: isBulkDeleting,
    onBulkDelete: bulkDelete,
  });

  const { deleteMutation, isDeleting } = useCouponMutations({
    onSuccess: async () => {
      dialog.close();
      await refetch();
    },
  });

  const openViewer = useCallback(
    (entity: Coupon) => {
      navigate(couponViewPath(entity));
    },
    [navigate],
  );

  const openEditor = useCallback(
    (entity: Coupon) => {
      navigate(couponEditPath(entity));
    },
    [navigate],
  );

  const rowActions = useMemo((): CrudRowAction<Coupon>[] => {
    const actions: CrudRowAction<Coupon>[] = [
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

  const copyCode = useCallback(
    async (code: string) => {
      try {
        await navigator.clipboard.writeText(code);
        notify.success(t.couponCodeCopied);
      } catch {
        notify.error(t.errorMessage);
      }
    },
    [t],
  );

  const columns = useMemo(
    () => [
      {
        id: "code",
        hideable: false,
        header: t.couponCode,
        cell: (entity: Coupon) => {
          const title = getBilingualTitle(entity.translations, entity.title ?? entity.code);
          return (
            <CrudEntityNameCell
              placeholder={
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <TicketPercent className="size-4" aria-hidden="true" />
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
                  {entity.isAdminOnly ? (
                    <StatusBadge label={t.couponIsAdminOnlyBadge} variant="info" />
                  ) : null}
                  <button
                    type="button"
                    className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                    onClick={() => {
                      void copyCode(entity.code);
                    }}
                    aria-label={t.copyCouponCode}
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
        header: t.couponType,
        cell: (entity: Coupon) => entity.type?.label || entity.type?.value || t.notSet,
      },
      {
        id: "scope",
        header: t.couponScope,
        cell: (entity: Coupon) => entity.scope?.label || entity.scope?.value || t.notSet,
      },
      {
        id: "value",
        header: t.couponValue,
        cell: (entity: Coupon) => formatCouponValue(entity),
      },
      {
        id: "status",
        header: t.status,
        cell: (entity: Coupon) => (
          <StatusBadge
            label={entity.status?.label || entity.status?.value || t.notSet}
            variant={statusVariant(entity.status?.value)}
          />
        ),
      },
      {
        id: "usage",
        header: t.couponUsageSection,
        cell: (entity: Coupon) => {
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
                  : `${t.couponUsageRemaining}: ${remaining}`}
              </p>
            </div>
          );
        },
      },
      {
        id: "window",
        header: t.couponWindow,
        cell: (entity: Coupon) => {
          const start = entity.startsAt ? formatDateTime(entity.startsAt) : "—";
          const end = entity.expireAt ? formatDateTime(entity.expireAt) : "—";
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
      title={t.coupons}
      actions={
        canCreate ? (
          <AppButton onClick={() => navigate(ROUTES.admin.couponNew)}>
            <Plus className="size-4" aria-hidden="true" />
            {t.addCoupon}
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
          tableId="coupons"
          onExportCsv={exportCsv}
          isExportingCsv={isExportingCsv}
          search={{
            value: search,
            onChange: setSearch,
            onReset: resetSearch,
            placeholder: t.searchCoupons,
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
          emptyDescription={t.emptyStateDefaultDescription}
          caption={t.coupons}
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
                getBilingualTitle(dialog.entity.translations, dialog.entity.title ?? dialog.entity.code),
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
