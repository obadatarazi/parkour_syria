import { Eye, HeartPulse, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router";

import { carePlanEditPath, carePlanViewPath, ROUTES } from "@/app/router/routes";
import { useCrudPermissions } from "@/features/auth";
import { CarePlanWidgets } from "@/features/care-plans/components/CarePlanWidgets";
import { useCarePlanMutations } from "@/features/care-plans/hooks/use-care-plan-mutations";
import { useCarePlansList } from "@/features/care-plans/hooks/use-care-plans-list";
import type { CarePlan } from "@/features/care-plans/types/care-plans.types";
import { getCarePlanCustomerLabel } from "@/features/care-plans/types/care-plans.types";
import { AppButton, ConfirmDialog, StatusBadge, UserLabelText } from "@/shared/components";
import { PERMISSIONS } from "@/shared/constants/permissions";
import {
  CrudEntityNameCell,
  CrudListPage,
  CrudListSection,
  CrudListTable,
  CrudTableActions,
  useCrudDialog,
  type CrudRowAction,
} from "@/shared/crud";
import {
  useLocalization,
  useTranslation,
} from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { useCrudPageGuidance } from "@/shared/guidance";
import { formatDeliveryDate } from "@/shared/lib/datetime.utils";

function statusVariant(
  value?: string | null,
): "success" | "warning" | "danger" | "info" | "neutral" {
  switch (value) {
    case "ACTIVE":
      return "success";
    case "PAUSED":
      return "warning";
    case "CANCELLED":
      return "danger";
    default:
      return "neutral";
  }
}

export function CarePlansPage() {
  const t = useTranslation();
  const { language } = useLocalization();
  const navigate = useNavigate();
  const guidance = useCrudPageGuidance("care-plans");
  const { canCreate, canUpdate, canDelete } = useCrudPermissions(PERMISSIONS.MANAGE_CARE_PLAN);
  const dialog = useCrudDialog<CarePlan>();
  const {
    items,
    page,
    setPage,
    setPageSize,
    total,
    pageSize,
    isLoading,
    isError,
    error,
    refetch,
    search,
    setSearch,
    resetSearch,
    filters,
    filterDefinitions,
    sort,
    setSort,
    sortDefinitions,
    exportCsv,
    isExportingCsv,
  } = useCarePlansList();

  const { deleteMutation, isDeleting } = useCarePlanMutations({
    onSuccess: async () => {
      dialog.close();
      await refetch();
    },
  });

  const openViewer = useCallback(
    (entity: CarePlan) => {
      navigate(carePlanViewPath(entity.id));
    },
    [navigate],
  );

  const openEditor = useCallback(
    (entity: CarePlan) => {
      navigate(carePlanEditPath(entity.id));
    },
    [navigate],
  );

  const rowActions = useMemo((): CrudRowAction<CarePlan>[] => {
    const actions: CrudRowAction<CarePlan>[] = [
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
        label: t.carePlanCancelAction,
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
        id: "customer",
        hideable: false,
        header: t.carePlanCustomer,
        cell: (entity: CarePlan) => (
          <CrudEntityNameCell
            placeholder={
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <HeartPulse className="size-4" aria-hidden="true" />
              </span>
            }
            size="sm"
            actions={
              <CrudTableActions entity={entity} actions={rowActions} ariaLabel={t.actions} />
            }
          >
            <div className="min-w-0 space-y-0.5">
              <button
                type="button"
                className="min-w-0 text-start font-semibold transition-colors hover:text-primary"
                onClick={() => openViewer(entity)}
              >
                <UserLabelText value={getCarePlanCustomerLabel(entity, t.notSet)} />
              </button>
              {entity.user?.email ? (
                <p className="truncate text-xs text-muted-foreground">{entity.user.email}</p>
              ) : null}
            </div>
          </CrudEntityNameCell>
        ),
      },
      {
        id: "status",
        header: t.status,
        cell: (entity: CarePlan) => (
          <StatusBadge
            label={entity.status?.label || entity.status?.value || t.notSet}
            variant={statusVariant(entity.status?.value)}
          />
        ),
      },
      {
        id: "frequency",
        header: t.carePlanFrequency,
        cell: (entity: CarePlan) =>
          entity.frequency?.label || entity.frequency?.value || t.notSet,
      },
      {
        id: "nextDelivery",
        header: t.carePlanNextDelivery,
        cell: (entity: CarePlan) =>
          entity.nextDeliveryAt ? formatDeliveryDate(entity.nextDeliveryAt, language) : t.notSet,
      },
      {
        id: "currentDiscount",
        header: t.carePlanCurrentDiscount,
        cell: (entity: CarePlan) => (
          <div className="space-y-0.5">
            <p className="font-bold text-foreground">{entity.currentDiscountPercent}%</p>
            <p className="text-xs text-muted-foreground">
              {t.carePlanDiscountBreakdown
                .replace("{current}", String(entity.currentDiscountPercent))
                .replace("{initial}", String(entity.initialDiscountPercent))
                .replace("{loyalty}", String(entity.loyaltyDiscountPercent))
                .replace("{cycles}", String(entity.completedCyclesCount))}
            </p>
          </div>
        ),
      },
      {
        id: "itemsCount",
        header: t.carePlanItemsCount,
        cell: (entity: CarePlan) => entity.itemsCount ?? entity.items?.length ?? "—",
      },
      {
        id: "missedPayments",
        header: t.carePlanMissedPayments,
        cell: (entity: CarePlan) => entity.missedPaymentCount,
      },
    ],
    [language, openViewer, rowActions, t],
  );

  return (
    <CrudListPage
      {...guidance.pageProps}
      title={t.carePlans}
      actions={
        canCreate ? (
          <AppButton onClick={() => navigate(ROUTES.admin.carePlanNew)}>
            <Plus className="size-4" aria-hidden="true" />
            {t.addCarePlan}
          </AppButton>
        ) : undefined
      }
    >
      <CarePlanWidgets />

      <CrudListSection>
        <CrudListTable
          guidanceAnchors={{
            search: guidance.searchDataGuidance,
            filters: guidance.filtersDataGuidance,
            rowActions: guidance.rowActionsDataGuidance,
          }}
          tableId="care-plans"
          onExportCsv={exportCsv}
          isExportingCsv={isExportingCsv}
          search={{
            value: search,
            onChange: setSearch,
            onReset: resetSearch,
            placeholder: t.searchCarePlans,
          }}
          filters={{
            definitions: filterDefinitions,
            values: filters.values,
            onChange: filters.setFilter,
            onReset: filters.resetFilters,
            hasActiveFilters: filters.hasActiveFilters,
          }}
          sort={{ definitions: sortDefinitions, value: sort, onChange: setSort }}
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
          caption={t.carePlans}
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

      <ConfirmDialog
        open={dialog.mode === "delete"}
        onOpenChange={(open) => {
          if (!open) dialog.close();
        }}
        title={t.carePlanCancelTitle}
        description={t.carePlanCancelDescription}
        confirmLabel={t.carePlanCancelAction}
        cancelLabel={t.cancel}
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={() => {
          if (dialog.entity) void deleteMutation.mutate(dialog.entity);
        }}
      />
    </CrudListPage>
  );
}
