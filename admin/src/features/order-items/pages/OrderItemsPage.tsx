import { Eye } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router";

import { useCrudPermissions } from "@/features/auth";
import { OrderItemViewDialog } from "@/features/order-items/components/OrderItemViewDialog";
import { useOrderItemsList } from "@/features/order-items/hooks/use-order-items-list";
import { orderItemsService } from "@/features/order-items/services/order-items.service";
import type { OrderItem } from "@/features/order-items/types/order-items.types";
import {
  orderItemOrderHref,
  orderItemProductHref,
} from "@/features/order-items/utils/order-item-links";
import { formatKwd } from "@/features/products/utils/product-display.utils";
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
import { useOpenEntityFromUrl } from "@/shared/hooks/use-open-entity-from-url";
import { formatDateTime } from "@/shared/lib/datetime.utils";

export function OrderItemsPage() {
  const t = useTranslation();
  const { language } = useLocalization();
  const guidance = useCrudPageGuidance("order-items");
  const { canShow } = useCrudPermissions(PERMISSIONS.MANAGE_ORDER_ITEM);
  const dialog = useCrudDialog<OrderItem>();
  useOpenEntityFromUrl(dialog.openView);

  const {
    items: orderItems,
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
    exportCsv,
    isExportingCsv,
  } = useOrderItemsList();

  const { data: orderItemDetail } = useCrudQuery({
    queryKey: ["order-items", "detail", String(dialog.entity?.id ?? "")],
    queryFn: () => orderItemsService.getById(dialog.entity!.id),
    enabled: dialog.mode === "view" && Boolean(dialog.entity?.id),
  });

  const viewingItem = useMemo(() => {
    if (!dialog.entity || dialog.mode !== "view") return null;
    return (
      orderItemDetail ??
      orderItems.find((item) => item.id === dialog.entity?.id) ??
      dialog.entity
    );
  }, [dialog.entity, dialog.mode, orderItemDetail, orderItems]);

  const rowActions = useMemo<CrudRowAction<OrderItem>[]>(() => {
    if (!canShow) return [];
    return [
      {
        id: "view",
        label: t.viewAction,
        icon: Eye,
        onSelect: (item) => dialog.openView(item),
      },
    ];
  }, [canShow, dialog, t]);

  const columns = useMemo(
    () => [
      {
        id: "order",
        hideable: false,
        header: t.orderNum,
        cell: (item: OrderItem) => {
          const href = orderItemOrderHref(item);
          const label = item.orderRefNumber || `#${item.orderId}`;
          return href ? (
            <Link
              to={href}
              className="font-mono text-xs font-bold text-brand hover:underline"
              onClick={(event) => event.stopPropagation()}
            >
              {label}
            </Link>
          ) : (
            <span className="font-mono text-xs font-bold">{label}</span>
          );
        },
      },
      {
        id: "product",
        header: t.product,
        cell: (item: OrderItem) => {
          const href = orderItemProductHref(item);
          const label = item.productTitle || item.product?.title || "—";
          return href ? (
            <Link
              to={href}
              className="block max-w-[16rem] truncate text-xs font-semibold text-brand hover:underline"
              title={label}
              onClick={(event) => event.stopPropagation()}
            >
              {label}
            </Link>
          ) : (
            <span className="block max-w-[16rem] truncate text-xs font-semibold" title={label}>
              {label}
            </span>
          );
        },
      },
      {
        id: "price",
        header: t.price,
        cell: (item: OrderItem) => (
          <span className="text-xs whitespace-nowrap">{formatKwd(item.price)}</span>
        ),
      },
      {
        id: "quantity",
        header: t.quantity,
        cell: (item: OrderItem) => (
          <span className="text-xs tabular-nums">{item.quantity}</span>
        ),
      },
      {
        id: "subTotal",
        header: t.subtotal,
        cell: (item: OrderItem) => (
          <span className="text-xs font-bold whitespace-nowrap">
            {formatKwd(
              item.subTotalPriceWithDiscount != null
                ? item.subTotalPriceWithDiscount
                : item.subTotalPrice,
            )}
          </span>
        ),
      },
      {
        id: "createdAt",
        header: t.date,
        cell: (item: OrderItem) => (
          <span className="text-xs whitespace-nowrap text-muted-foreground">
            {formatDateTime(item.createdAt, language)}
          </span>
        ),
      },
    ],
    [language, t],
  );

  return (
    <CrudListPage {...guidance.pageProps} title={t.orderItemsPage}>
      <CrudListSection>
        <CrudListTable
          guidanceAnchors={{
            search: guidance.searchDataGuidance,
            rowActions: guidance.rowActionsDataGuidance,
          }}
          tableId="order-items"
          onExportCsv={exportCsv}
          isExportingCsv={isExportingCsv}
          search={{
            value: search,
            onChange: setSearch,
            onReset: resetSearch,
            placeholder: t.searchOrderItems,
          }}
          sort={{ definitions: sortDefinitions, value: sort, onChange: setSort }}
          columns={columns}
          data={orderItems}
          isLoading={isLoading}
          isError={isError}
          errorTitle={t.errorStateDefaultTitle}
          errorDescription={resolveServiceErrorMessage(error, t)}
          retryLabel={t.tryAgain}
          onRetry={() => void refetch()}
          emptyTitle={t.noData}
          emptyDescription={t.emptyStateDefaultDescription}
          rowActions={
            canShow
              ? (item) => (
                  <CrudTableActions
                    entity={item}
                    actions={rowActions}
                    ariaLabel={t.actions}
                  />
                )
              : undefined
          }
          actionsHeader={canShow ? t.actions : undefined}
          caption={t.orderItemsPage}
          showingLabel={`${t.showing} ${orderItems.length} ${t.of} ${total} ${t.results}`}
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

      <OrderItemViewDialog
        open={dialog.mode === "view"}
        orderItem={viewingItem}
        onOpenChange={(open) => {
          if (!open) dialog.close();
        }}
      />
    </CrudListPage>
  );
}
