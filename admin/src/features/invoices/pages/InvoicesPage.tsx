import { Download } from "lucide-react";
import { useMemo } from "react";

import { useAbility } from "@/features/auth";
import {
  InvoiceCustomerCell,
  InvoiceOrderCell,
} from "@/features/invoices/components/InvoiceRelationCells";
import { InvoiceViewDialog } from "@/features/invoices/components/InvoiceViewDialog";
import { useInvoicePdfDownload } from "@/features/invoices/hooks/use-invoice-pdf-download";
import { useInvoicesList } from "@/features/invoices/hooks/use-invoices-list";
import { invoicesService } from "@/features/invoices/services/invoices.service";
import type { Invoice } from "@/features/invoices/types/invoices.types";
import { getInvoicePaymentLabel } from "@/features/invoices/utils/map-invoice-from-api";
import { formatKwd } from "@/features/products/utils/product-display.utils";
import { StatusBadge } from "@/shared/components";
import { PERMISSIONS } from "@/shared/constants/permissions";
import {
  CrudListPage,
  CrudListSection,
  CrudListTable,
  CrudTableActions,
  useCrudDialog,
  useCrudQuery,
} from "@/shared/crud";
import type { CrudRowAction } from "@/shared/crud/types/crud.types";
import {
  useLocalization,
  useTranslation,
} from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { useCrudPageGuidance } from "@/shared/guidance";
import { useInvoiceStatusOptions } from "@/shared/hooks/use-options";
import { formatDateTime } from "@/shared/lib/datetime.utils";

function statusVariant(value?: string | null): "success" | "warning" | "danger" | "info" | "neutral" {
  switch (value) {
    case "PAID":
      return "success";
    case "UNPAID":
      return "warning";
    case "FAILED":
    case "CANCELLED":
    case "EXPIRED":
    case "REFUNDED":
      return "danger";
    default:
      return "neutral";
  }
}

export function InvoicesPage() {
  const t = useTranslation();
  const { language } = useLocalization();
  const guidance = useCrudPageGuidance("invoices");
  const ability = useAbility();
  const canDownload = ability.can(PERMISSIONS.PERMISSION_DOWNLOAD_INVOICE, "all");
  const dialog = useCrudDialog<Invoice>();
  const { downloadPdf, isDownloading } = useInvoicePdfDownload();
  const {
    items: invoices,
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
    exportCsv,
    isExportingCsv,
  } = useInvoicesList();

  // List is slim; View loads Details via getById (same pattern as Orders).
  const { data: invoiceDetail } = useCrudQuery({
    queryKey: ["invoices", "detail", String(dialog.entity?.id ?? "")],
    queryFn: () => invoicesService.getById(dialog.entity!.id),
    enabled: dialog.mode === "view" && Boolean(dialog.entity?.id),
  });

  const viewingInvoice = useMemo(() => {
    if (!dialog.entity || dialog.mode !== "view") return null;
    const listRow =
      invoices.find((invoice) => invoice.id === dialog.entity?.id) ?? dialog.entity;
    if (!invoiceDetail) return listRow;
    // Details still omit `customer`; keep the slim list buyer on View.
    return {
      ...invoiceDetail,
      customer: invoiceDetail.customer ?? listRow.customer,
    };
  }, [dialog.entity, dialog.mode, invoiceDetail, invoices]);

  const rowActions = useMemo<CrudRowAction<Invoice>[]>(() => {
    const actions: CrudRowAction<Invoice>[] = [];

    if (canDownload) {
      actions.push({
        id: "download-pdf",
        label: t.downloadInvoice,
        icon: Download,
        onSelect: (invoice) => {
          void downloadPdf(invoice.invoiceNumber);
        },
      });
    }

    return actions;
  }, [canDownload, downloadPdf, t]);

  const { options: statusOptions } = useInvoiceStatusOptions();

  const columns = useMemo(
    () => [
      {
        id: "invoiceNumber",
        hideable: false,
        header: t.invoiceNumber,
        className: "w-[18%] min-w-0 whitespace-normal",
        cell: (invoice: Invoice) => (
          <div className="min-w-0 space-y-0.5">
            <button
              type="button"
              className="font-mono text-xs font-bold text-brand hover:underline"
              onClick={() => dialog.openView(invoice)}
            >
              {invoice.invoiceNumber || `#${invoice.id}`}
            </button>
            {rowActions.length > 0 ? (
              <CrudTableActions
                entity={invoice}
                actions={rowActions.map((action) =>
                  action.id === "download-pdf"
                    ? { ...action, disabled: isDownloading || !invoice.invoiceNumber }
                    : action,
                )}
                ariaLabel={t.actions}
              />
            ) : null}
          </div>
        ),
      },
      {
        id: "customer",
        header: t.customer,
        className: "w-[14%] min-w-0 whitespace-normal",
        cell: (invoice: Invoice) => <InvoiceCustomerCell invoice={invoice} />,
      },
      {
        id: "order",
        header: t.orderNum,
        className: "w-[16%] min-w-0 whitespace-normal",
        cell: (invoice: Invoice) => <InvoiceOrderCell invoice={invoice} />,
      },
      {
        id: "status",
        header: t.invoiceStatus,
        className: "w-[10%] min-w-0",
        cell: (invoice: Invoice) => {
          const value = invoice.status?.value ?? "";
          const label =
            statusOptions.find((option) => option.value === value)?.label ||
            invoice.status?.label ||
            value ||
            t.notSet;
          return (
            <StatusBadge
              label={label}
              variant={statusVariant(value)}
            />
          );
        },
      },
      {
        id: "payment",
        header: t.payment,
        className: "w-[14%] min-w-0 whitespace-normal",
        cell: (invoice: Invoice) => (
          <span className="text-xs text-muted-foreground">
            {getInvoicePaymentLabel(invoice, language === "ar" ? "ar" : "en") || "—"}
          </span>
        ),
      },
      {
        id: "total",
        header: t.total,
        className: "w-[10%] min-w-0 whitespace-nowrap",
        cell: (invoice: Invoice) => (
          <span className="text-xs font-bold whitespace-nowrap">
            {formatKwd(invoice.totalPrice)}
          </span>
        ),
      },
      {
        id: "paidAt",
        header: t.paidAt,
        className: "w-[14%] min-w-0",
        cell: (invoice: Invoice) => (
          <span className="text-xs whitespace-nowrap text-muted-foreground">
            {formatDateTime(invoice.paidAt, language)}
          </span>
        ),
      },
    ],
    [dialog, isDownloading, language, rowActions, statusOptions, t],
  );

  return (
    <CrudListPage {...guidance.pageProps} title={t.invoices}>
      <CrudListSection>
        <CrudListTable
          guidanceAnchors={{
            search: guidance.searchDataGuidance,
            filters: guidance.filtersDataGuidance,
            rowActions: guidance.rowActionsDataGuidance,
          }}
          tableId="invoices"
          onExportCsv={exportCsv}
          isExportingCsv={isExportingCsv}
          search={{
            value: search,
            onChange: setSearch,
            onReset: resetSearch,
            placeholder: t.searchInvoices,
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
          data={invoices}
          isLoading={isLoading}
          isError={isError}
          errorTitle={t.errorStateDefaultTitle}
          errorDescription={resolveServiceErrorMessage(error, t)}
          retryLabel={t.tryAgain}
          onRetry={() => void refetch()}
          emptyTitle={t.noData}
          emptyDescription={t.emptyStateDefaultDescription}
          caption={t.invoices}
          showingLabel={`${t.showing} ${invoices.length} ${t.of} ${total} ${t.results}`}
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

      <InvoiceViewDialog
        open={dialog.mode === "view"}
        invoice={viewingInvoice}
        canDownload={canDownload}
        onOpenChange={(open) => {
          if (!open) dialog.close();
        }}
      />
    </CrudListPage>
  );
}
