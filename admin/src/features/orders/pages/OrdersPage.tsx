import { Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

import { orderEditPath, orderViewPath, ROUTES } from "@/app/router/routes";
import { useAbility, useCrudPermissions } from "@/features/auth";
import { useInvoicePdfDownload } from "@/features/invoices/hooks/use-invoice-pdf-download";
import { OrderCreatedByCell } from "@/features/orders/components/OrderCreatedByCell";
import { OrderCustomerCell } from "@/features/orders/components/OrderCustomerCell";
import { OrderDocumentActions } from "@/features/orders/components/OrderDocumentActions";
import { OrderItemsQuickDialog } from "@/features/orders/components/OrderItemsQuickDialog";
import { OrderRowTitleCell } from "@/features/orders/components/OrderRowTitleCell";
import { OrderStatusQuickAction } from "@/features/orders/components/OrderStatusQuickAction";
import { useOrderMutations } from "@/features/orders/hooks/use-order-mutations";
import { useOrderPackingSlipDownload } from "@/features/orders/hooks/use-order-packing-slip-download";
import { useOrdersList } from "@/features/orders/hooks/use-orders-list";
import type { Order } from "@/features/orders/types/orders.types";
import { getOrderAmountDue } from "@/features/orders/types/orders.types";
import { mapOrderToPartyDisplay } from "@/features/orders/utils/order-customer-display";
import { getOrderPaymentLabel } from "@/features/orders/utils/map-order-from-api";
import { getOrderStatusVariant } from "@/features/orders/utils/order-status.utils";
import { formatKwd } from "@/features/products/utils/product-display.utils";
import { AppButton, TableCellText } from "@/shared/components";
import { PERMISSIONS } from "@/shared/constants/permissions";
import { CrudListPage, CrudListSection, CrudListTable } from "@/shared/crud";
import {
  useLocalization,
  useTranslation,
} from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { ordersGuidanceConfig } from "@/shared/guidance/configs/guidance-configs";
import { useCrudPageGuidance } from "@/shared/guidance/hooks/use-crud-page-guidance";
import { formatTableDateTime } from "@/shared/lib/datetime.utils";

export function OrdersPage() {
  const t = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useLocalization();
  const ability = useAbility();
  const guidance = useCrudPageGuidance("orders", ordersGuidanceConfig);
  const { canCreate, canUpdate } = useCrudPermissions(PERMISSIONS.MANAGE_ORDER);
  const canDownloadPackingSlip = ability.can(PERMISSIONS.PERMISSION_DOWNLOAD_ORDER, "all");
  const canDownloadInvoice = ability.can(PERMISSIONS.PERMISSION_DOWNLOAD_INVOICE, "all");
  const { downloadPackingSlip, isDownloading: isPackingSlipDownloading } =
    useOrderPackingSlipDownload();
  const { downloadPdf, isDownloading: isInvoiceDownloading } = useInvoicePdfDownload();
  const [pendingDocumentOrderId, setPendingDocumentOrderId] = useState<number | null>(null);
  const [itemsOrder, setItemsOrder] = useState<Order | null>(null);
  const {
    items: orders,
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
    statusOptions,
    orderRefNumber,
    clearOrderRefNumber,
    exportCsv,
    isExportingCsv,
  } = useOrdersList();

  const { quickUpdateStatus, isStatusUpdating } = useOrderMutations();

  useEffect(() => {
    const orderRef = searchParams.get("orderRefNumber")?.trim();
    if (orderRef) {
      navigate(orderViewPath(orderRef), { replace: true });
      return;
    }
    const raw = searchParams.get("id")?.trim();
    if (!raw) return;
    const id = Number(raw);
    if (!Number.isFinite(id) || id <= 0) return;
    navigate(orderViewPath(String(id)), { replace: true });
  }, [navigate, searchParams]);

  const openOrderViewer = useCallback(
    (order: Order) => {
      navigate(orderViewPath(order));
    },
    [navigate],
  );

  const openOrderEditor = useCallback(
    (order: Order) => {
      navigate(orderEditPath(order));
    },
    [navigate],
  );

  const handleChangeStatus = useCallback(
    async (order: Order, status: string) => {
      await quickUpdateStatus(order, status);
      const label = statusOptions.find((option) => option.value === status)?.label ?? status;
      patchItems((items) =>
        items.map((item) =>
          item.id === order.id
            ? {
                ...item,
                status: {
                  value: status,
                  label,
                },
              }
            : item,
        ),
      );
      guidance.completeChecklistItem("change-status");
    },
    [guidance, patchItems, quickUpdateStatus, statusOptions],
  );

  const firstOrderId = orders[0]?.id;

  const columns = useMemo(
    () => [
      {
        id: "orderNum",
        hideable: false,
        header: t.orderNum,
        className: "w-[13%] min-w-0 whitespace-normal",
        cell: (order: Order) => (
          <OrderRowTitleCell
            order={order}
            canUpdate={canUpdate}
            statusOptions={statusOptions}
            isStatusUpdating={isStatusUpdating}
            onView={openOrderViewer}
            onEdit={openOrderEditor}
            onChangeStatus={(entity, status) => void handleChangeStatus(entity, status)}
          />
        ),
      },
      {
        id: "customer",
        header: t.customer,
        className: "w-[12%] min-w-0 whitespace-normal",
        cell: (order: Order) => (
          <OrderCustomerCell party={mapOrderToPartyDisplay(order)} />
        ),
      },
      {
        id: "createdBy",
        header: t.orderCreatedBy,
        className: "w-[8%] min-w-0 whitespace-normal",
        cell: (order: Order) => (
          <OrderCreatedByCell party={mapOrderToPartyDisplay(order)} />
        ),
      },
      {
        id: "source",
        header: t.orderSource,
        className: "w-[9%] min-w-0 whitespace-normal",
        cell: (order: Order) => (
          <TableCellText
            title={order.source?.label || order.source?.value || undefined}
            className="text-sm text-muted-foreground"
          >
            {order.source?.label || order.source?.value || "—"}
          </TableCellText>
        ),
      },
      {
        id: "status",
        header: t.status,
        className: "w-[11%] min-w-0 whitespace-normal",
        cell: (order: Order) => {
          const isGuidanceAnchor = order.id === firstOrderId;
          return (
            <OrderStatusQuickAction
              order={order}
              canUpdate={canUpdate}
              statusOptions={statusOptions}
              isStatusUpdating={isStatusUpdating}
              variant={getOrderStatusVariant(order.status?.value)}
              onChangeStatus={(entity, status) => void handleChangeStatus(entity, status)}
              dataGuidance={
                isGuidanceAnchor ? guidance.statusDataGuidance : undefined
              }
            />
          );
        },
      },
      {
        id: "items",
        header: t.items,
        className: "w-[5%] text-center",
        headerClassName: "text-center",
        cell: (order: Order) => {
          const count = order.itemsCount ?? order.items?.length ?? 0;
          return (
            <button
              type="button"
              className="text-sm font-semibold text-brand hover:underline"
              title={t.viewOrderItems}
              onClick={(event) => {
                event.stopPropagation();
                setItemsOrder(order);
              }}
            >
              {count}
            </button>
          );
        },
      },
      {
        id: "total",
        header: t.total,
        className: "w-[10%] min-w-0 whitespace-normal",
        cell: (order: Order) => (
          <div className="min-w-0 space-y-1">
            <span className="block truncate text-sm font-bold text-foreground">
              {formatKwd(getOrderAmountDue(order))}
            </span>
            {(order.couponCodes?.length ?? 0) > 0 ? (
              <div className="flex flex-wrap gap-1">
                {(order.couponCodes ?? []).slice(0, 2).map((code) => (
                  <span
                    key={code}
                    className="inline-flex max-w-full truncate rounded-full border border-border bg-muted/40 px-1.5 py-0.5 font-mono text-xs font-medium text-muted-foreground"
                    title={code}
                  >
                    {code}
                  </span>
                ))}
                {(order.couponCodes?.length ?? 0) > 2 ? (
                  <span className="text-xs text-muted-foreground">
                    +{(order.couponCodes?.length ?? 0) - 2}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        ),
      },
      {
        id: "payment",
        header: t.payment,
        className: "w-[10%] min-w-0 whitespace-normal",
        cell: (order: Order) => {
          const label =
            getOrderPaymentLabel(order, language === "ar" ? "ar" : "en") || "—";
          return (
            <TableCellText title={label} className="text-sm text-muted-foreground">
              {label}
            </TableCellText>
          );
        },
      },
      {
        id: "date",
        header: t.date,
        className: "w-[11%] min-w-0",
        cell: (order: Order) => {
          const label = formatTableDateTime(order.createdAt, language);
          return (
            <TableCellText title={label} className="text-sm text-muted-foreground">
              {label}
            </TableCellText>
          );
        },
      },
    ],
    [
      canUpdate,
      firstOrderId,
      guidance,
      handleChangeStatus,
      isStatusUpdating,
      language,
      openOrderEditor,
      openOrderViewer,
      statusOptions,
      t,
    ],
  );

  return (
    <CrudListPage
      title={t.orders}
      {...guidance.pageProps}
      actions={
        canCreate ? (
          <AppButton onClick={() => navigate(ROUTES.admin.orderNew)}>
            <Plus className="size-4" aria-hidden="true" />
            {t.addOrder}
          </AppButton>
        ) : undefined
      }
    >
      <CrudListSection>
        {orderRefNumber ? (
          <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-brand/20 bg-brand/5 px-3 py-2 text-sm">
            <span className="text-muted-foreground">{t.orderNum}:</span>
            <span className="font-mono font-semibold text-foreground">{orderRefNumber}</span>
            <button
              type="button"
              className="ms-auto text-xs font-medium text-brand hover:underline"
              onClick={clearOrderRefNumber}
            >
              {t.clearFilters}
            </button>
          </div>
        ) : null}
        <CrudListTable
          tableId="orders"
          onExportCsv={exportCsv}
          isExportingCsv={isExportingCsv}
          guidanceAnchors={{
            search: guidance.searchDataGuidance,
            filters: guidance.filtersDataGuidance,
            rowActions: guidance.rowActionsDataGuidance,
          }}
          search={{
            value: search,
            onChange: setSearch,
            onReset: resetSearch,
            placeholder: t.searchOrders,
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
          data={orders}
          isLoading={isLoading}
          isError={isError}
          errorTitle={t.errorStateDefaultTitle}
          errorDescription={resolveServiceErrorMessage(error, t)}
          retryLabel={t.tryAgain}
          onRetry={() => void refetch()}
          emptyTitle={t.noData}
          emptyDescription={t.emptyStateDefaultDescription}
          rowActions={(order) => {
            const isRowPending = pendingDocumentOrderId === order.id;
            const isAnyDocumentBusy = isInvoiceDownloading || isPackingSlipDownloading;

            return (
              <div className="flex items-center justify-end gap-0.5">
                <OrderDocumentActions
                  canDownloadInvoice={canDownloadInvoice}
                  canDownloadPackingSlip={canDownloadPackingSlip}
                  hasInvoiceNumber={Boolean(order.invoice?.invoiceNumber)}
                  hasOrderRefNumber={Boolean(order.orderRefNumber)}
                  isBusy={isAnyDocumentBusy && !isRowPending}
                  isInvoiceDownloading={isRowPending && isInvoiceDownloading}
                  isPackingSlipDownloading={isRowPending && isPackingSlipDownloading}
                  invoiceLabel={t.downloadInvoice}
                  packingSlipLabel={t.downloadPackingSlip}
                  onDownloadInvoice={() => {
                    if (!order.invoice?.invoiceNumber) return;
                    setPendingDocumentOrderId(order.id);
                    void downloadPdf(order.invoice.invoiceNumber).finally(() => {
                      setPendingDocumentOrderId(null);
                    });
                  }}
                  onDownloadPackingSlip={() => {
                    if (!order.orderRefNumber) return;
                    setPendingDocumentOrderId(order.id);
                    void downloadPackingSlip(order.orderRefNumber).finally(() => {
                      setPendingDocumentOrderId(null);
                    });
                  }}
                />
              </div>
            );
          }}
          actionsHeader={t.actions}
          caption={t.orders}
          showingLabel={`${t.showing} ${orders.length} ${t.of} ${total} ${t.results}`}
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

      <OrderItemsQuickDialog
        open={Boolean(itemsOrder)}
        order={itemsOrder}
        onOpenChange={(open) => {
          if (!open) setItemsOrder(null);
        }}
      />
    </CrudListPage>
  );
}
