import { Eye, Pencil } from "lucide-react";
import { useMemo } from "react";

import { useRecentOrdersList } from "@/features/dashboard/hooks/use-recent-orders-list";
import type { RecentOrder } from "@/features/dashboard/types/dashboard.types";
import {
  formatOrderDate,
  resolveOrderStatusVariant,
} from "@/features/dashboard/utils/dashboard.utils";
import { formatKwd } from "@/features/products/utils/product-display.utils";
import { BodyText, StatusBadge } from "@/shared/components";
import {
  CrudListSection,
  CrudListTable,
  type CrudRowAction,
  CrudTableActions,
  useCrudEmptyMessages,
  useCrudTableBulkActions,
} from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type RecentOrdersSectionProps = {
  orders: RecentOrder[];
};

export function RecentOrdersSection({ orders }: RecentOrdersSectionProps) {
  const t = useTranslation();
  const {
    search,
    filters,
    pagination,
    paginationMeta,
    selection,
    pageItems,
    filteredItems,
    emptyVariant,
    filterDefinitions,
  } = useRecentOrdersList(orders);

  const rowActions = useMemo<CrudRowAction<RecentOrder>[]>(
    () => [
      {
        id: "view",
        label: t.viewAction,
        icon: Eye,
        onSelect: () => undefined,
      },
      {
        id: "edit",
        label: t.editAction,
        icon: Pencil,
        onSelect: () => undefined,
      },
    ],
    [t],
  );

  const columns = useMemo(
    () => [
      {
        id: "order",
        header: t.orderNum,
        cell: (row: RecentOrder) => (
          <span className="font-mono text-xs font-semibold text-brand">{row.id}</span>
        ),
      },
      {
        id: "customer",
        header: t.customer,
        cell: (row: RecentOrder) => (
          <div>
            <BodyText className="font-medium">{row.customerEn}</BodyText>
            <BodyText className="text-xs text-muted-foreground">{row.email}</BodyText>
          </div>
        ),
      },
      {
        id: "status",
        header: t.status,
        cell: (row: RecentOrder) => (
          <StatusBadge
            label={row.status.label}
            variant={resolveOrderStatusVariant(row.status)}
          />
        ),
      },
      {
        id: "total",
        header: t.total,
        cell: (row: RecentOrder) => (
          <span className="font-semibold">
            {formatKwd(row.total)}
          </span>
        ),
      },
      {
        id: "date",
        header: t.date,
        cell: (row: RecentOrder) => (
          <span className="text-muted-foreground">{formatOrderDate(row.createdAt, "en")}</span>
        ),
      },
    ],
    [t],
  );

  const emptyMessages = useCrudEmptyMessages(emptyVariant);

  const { tableSelectionProps } = useCrudTableBulkActions({
    selection,
    canDelete: false,
    onBulkDelete: async () => undefined,
  });

  return (
    <CrudListSection title={t.recentOrdersTitle}>
      <CrudListTable
        tableId="dashboard-recent-orders"
        search={{
          value: search.search,
          onChange: search.setSearch,
          onReset: search.resetSearch,
          placeholder: t.searchPlaceholder,
          ariaLabel: t.search,
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
        data={pageItems}
        caption={t.recentOrdersTitle}
        emptyTitle={emptyMessages?.title ?? t.noData}
        emptyDescription={emptyMessages?.description ?? t.emptyStateDefaultDescription}
        actionsHeader={t.actions}
        rowActions={(row) => (
          <CrudTableActions entity={row} actions={rowActions} ariaLabel={t.actions} />
        )}
        pagination={{
          page: pagination.page,
          pageSize: pagination.pageSize,
          totalItems: filteredItems.length,
          onPageChange: pagination.setPage,
          previousLabel: t.previous,
          nextLabel: t.nextPage,
        }}
        showingLabel={`${t.showing} ${paginationMeta.start}-${paginationMeta.end} ${t.of} ${paginationMeta.totalItems}`}
      />
    </CrudListSection>
  );
}
