import { Eye, FileText, Package, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

import { prescriptionEditPath, prescriptionViewPath, ROUTES } from "@/app/router/routes";
import { useCrudPermissions } from "@/features/auth";
import { PrescriptionFileViewDialog } from "@/features/prescriptions/components/PrescriptionFileViewDialog";
import { PrescriptionQuickActions } from "@/features/prescriptions/components/PrescriptionQuickActions";
import { PrescriptionStatusQuickAction } from "@/features/prescriptions/components/PrescriptionStatusQuickAction";
import { usePrescriptionMutations } from "@/features/prescriptions/hooks/use-prescription-mutations";
import { usePrescriptionsList } from "@/features/prescriptions/hooks/use-prescriptions-list";
import type { Prescription } from "@/features/prescriptions/types/prescriptions.types";
import { getPrescriptionCustomerLabel } from "@/features/prescriptions/types/prescriptions.types";
import { getPrescriptionStatusVariant } from "@/features/prescriptions/utils/prescription-status.utils";
import { AppButton, ConfirmDialog, TableCellText, UserLabelText } from "@/shared/components";
import { PERMISSIONS } from "@/shared/constants/permissions";
import {
  CrudEntityNameCell,
  CrudListPage,
  CrudListSection,
  CrudListTable,
  type CrudRowAction,
  CrudTableActions,
  useCrudDialog,
} from "@/shared/crud";
import {
  useLocalization,
  useTranslation,
} from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { useCrudPageGuidance } from "@/shared/guidance";
import { formatTableDateTime } from "@/shared/lib/datetime.utils";

export function PrescriptionsPage() {
  const t = useTranslation();
  const { language } = useLocalization();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const guidance = useCrudPageGuidance("prescriptions");
  const { canCreate, canUpdate, canDelete } = useCrudPermissions(PERMISSIONS.MANAGE_PRESCRIPTION);
  const dialog = useCrudDialog<Prescription>();
  const [filePreviewPrescription, setFilePreviewPrescription] = useState<Prescription | null>(null);
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
    patchItems,
    search,
    setSearch,
    resetSearch,
    filters,
    filterDefinitions,
    sort,
    setSort,
    sortDefinitions,
    statusOptions,
    exportCsv,
    isExportingCsv,
  } = usePrescriptionsList();

  const { deleteMutation, quickUpdateStatus, isDeleting, isStatusUpdating } =
    usePrescriptionMutations({
      onSuccess: async () => {
        dialog.close();
        await refetch();
      },
    });

  const openPrescription = useCallback(
    (ref: Prescription) => {
      navigate(canUpdate ? prescriptionEditPath(ref) : prescriptionViewPath(ref));
    },
    [canUpdate, navigate],
  );

  useEffect(() => {
    const legacyId = searchParams.get("id")?.trim();
    const prescriptionNumber = searchParams.get("number")?.trim() ?? searchParams.get("prescriptionNumber")?.trim();
    const openPath = (ref: string) =>
      canUpdate ? prescriptionEditPath(ref) : prescriptionViewPath(ref);
    if (prescriptionNumber) {
      navigate(openPath(prescriptionNumber), { replace: true });
      return;
    }
    if (!legacyId) return;
    const id = Number(legacyId);
    if (!Number.isFinite(id) || id <= 0) return;
    navigate(openPath(String(id)), { replace: true });
  }, [canUpdate, navigate, searchParams]);

  const openViewer = useCallback(
    (entity: Prescription) => {
      navigate(prescriptionViewPath(entity));
    },
    [navigate],
  );

  const openEditor = useCallback(
    (entity: Prescription) => {
      navigate(prescriptionEditPath(entity));
    },
    [navigate],
  );

  const openAddProducts = useCallback(
    (entity: Prescription) => {
      navigate(prescriptionEditPath(entity, "products"));
    },
    [navigate],
  );

  const openViewFile = useCallback((entity: Prescription) => {
    if (!entity.fileUrl) return;
    setFilePreviewPrescription(entity);
  }, []);

  const handleChangeStatus = useCallback(
    async (entity: Prescription, status: string) => {
      const result = await quickUpdateStatus(entity, status);
      if (!result.ok || !result.data) return;
      const label = statusOptions.find((option) => option.value === status)?.label ?? status;
      patchItems((current) =>
        current.map((item) =>
          item.id === entity.id
            ? {
                ...item,
                ...result.data,
                status: result.data.status ?? { value: status, label },
              }
            : item,
        ),
      );
    },
    [patchItems, quickUpdateStatus, statusOptions],
  );

  const rowActions = useMemo((): CrudRowAction<Prescription>[] => {
    const actions: CrudRowAction<Prescription>[] = [
      {
        id: "view",
        label: t.viewAction,
        icon: Eye,
        onSelect: openViewer,
      },
      {
        id: "view-file",
        label: t.prescriptionQuickViewFile,
        icon: FileText,
        onSelect: openViewFile,
      },
    ];
    if (canUpdate) {
      actions.push({
        id: "add-products",
        label: t.prescriptionQuickAddProducts,
        icon: Package,
        onSelect: openAddProducts,
      });
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
  }, [canDelete, canUpdate, dialog, openAddProducts, openEditor, openViewFile, openViewer, t]);

  const columns = useMemo(
    () => [
      {
        id: "prescriptionNumber",
        hideable: false,
        header: t.rxId,
        cell: (entity: Prescription) => (
          <CrudEntityNameCell
            placeholder={
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <FileText className="size-4" aria-hidden="true" />
              </span>
            }
            size="sm"
            actions={
              <CrudTableActions entity={entity} actions={rowActions} ariaLabel={t.actions} />
            }
          >
            <button
              type="button"
              className="min-w-0 text-start font-mono text-sm font-semibold text-brand transition-colors hover:underline"
              onClick={() => openPrescription(entity)}
            >
              {entity.prescriptionNumber || `#${entity.id}`}
            </button>
          </CrudEntityNameCell>
        ),
      },
      {
        id: "customer",
        header: t.customer,
        cell: (entity: Prescription) => (
          <div className="min-w-0 space-y-0.5">
            <UserLabelText value={getPrescriptionCustomerLabel(entity, t.notSet)} />
            {entity.customer?.email ? (
              <p className="truncate text-xs text-muted-foreground">{entity.customer.email}</p>
            ) : null}
          </div>
        ),
      },
      {
        id: "status",
        header: t.status,
        cell: (entity: Prescription) => (
          <PrescriptionStatusQuickAction
            prescription={entity}
            canUpdate={canUpdate}
            statusOptions={statusOptions}
            isStatusUpdating={isStatusUpdating}
            variant={getPrescriptionStatusVariant(entity.status?.value)}
            onChangeStatus={(item, status) => void handleChangeStatus(item, status)}
          />
        ),
      },
      {
        id: "productsCount",
        header: t.prescriptionProductsCount,
        cell: (entity: Prescription) => entity.productsCount ?? entity.products?.length ?? 0,
      },
      {
        id: "notes",
        header: t.pharmacistNote,
        cell: (entity: Prescription) => {
          const notes = entity.notes?.trim() || "—";
          return (
            <TableCellText title={notes} className="max-w-[220px] text-sm text-muted-foreground">
              {notes}
            </TableCellText>
          );
        },
      },
      {
        id: "date",
        header: t.date,
        cell: (entity: Prescription) => {
          const label = formatTableDateTime(entity.createdAt, language);
          return (
            <TableCellText title={label} className="text-sm text-muted-foreground">
              {label}
            </TableCellText>
          );
        },
      },
      {
        id: "quickActions",
        hideable: false,
        header: t.actions,
        cell: (entity: Prescription) => (
          <PrescriptionQuickActions
            prescription={entity}
            canUpdate={canUpdate}
            viewFileLabel={t.prescriptionQuickViewFile}
            addProductsLabel={t.prescriptionQuickAddProducts}
            onViewFile={openViewFile}
            onAddProducts={openAddProducts}
          />
        ),
      },
    ],
    [
      canUpdate,
      handleChangeStatus,
      isStatusUpdating,
      language,
      openAddProducts,
      openPrescription,
      openViewFile,
      rowActions,
      statusOptions,
      t,
    ],
  );

  return (
    <CrudListPage
      {...guidance.pageProps}
      title={t.prescriptions}
      actions={
        canCreate ? (
          <AppButton onClick={() => navigate(ROUTES.admin.prescriptionNew)}>
            <Plus className="size-4" aria-hidden="true" />
            {t.addPrescription}
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
          tableId="prescriptions"
          onExportCsv={exportCsv}
          isExportingCsv={isExportingCsv}
          search={{
            value: search,
            onChange: setSearch,
            onReset: resetSearch,
            placeholder: t.searchPrescriptions,
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
          caption={t.prescriptions}
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
        title={t.prescriptionDeleteTitle}
        description={t.prescriptionDeleteDescription}
        confirmLabel={t.deleteAction}
        cancelLabel={t.cancel}
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={() => {
          if (dialog.entity) void deleteMutation.mutate(dialog.entity);
        }}
      />

      <PrescriptionFileViewDialog
        prescription={filePreviewPrescription}
        open={filePreviewPrescription != null}
        onOpenChange={(open) => {
          if (!open) setFilePreviewPrescription(null);
        }}
      />
    </CrudListPage>
  );
}
