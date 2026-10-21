import { Eye } from "lucide-react";
import { useMemo, useState } from "react";

import { useCrudPermissions } from "@/features/auth";
import { InventoryInlineNumberCell } from "@/features/inventory/components/InventoryInlineNumberCell";
import { InventoryItemViewDialog } from "@/features/inventory/components/InventoryItemViewDialog";
import { InventoryStatsGrid } from "@/features/inventory/components/InventoryStatsGrid";
import { INVENTORY_STOCK_STATUS_FILTER_ID } from "@/features/inventory/constants/inventory.constants";
import { useInventoryInlineUpdate } from "@/features/inventory/hooks/use-inventory-inline-update";
import { useInventoryList } from "@/features/inventory/hooks/use-inventory-list";
import type { InventoryVariantRow, StockStatus } from "@/features/inventory/types/inventory.types";
import {
  getInventoryRowImage,
  getInventoryRowSku,
} from "@/features/inventory/utils/flatten-product-variants";
import { formatKwd } from "@/features/products/utils/product-display.utils";
import { getVariantDisplayLabel } from "@/features/products/utils/variant-attribute.utils";
import { StatusBadge } from "@/shared/components";
import { PERMISSIONS } from "@/shared/constants/permissions";
import {
  CRUD_FILTER_ALL_VALUE,
  CrudEntityNameCell,
  CrudListPage,
  CrudListSection,
  CrudListTable,
  CrudTableActions,
  type CrudRowAction,
} from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { useCrudPageGuidance } from "@/shared/guidance";

function stockBadgeVariant(status: StockStatus) {
  if (status === "out") return "danger" as const;
  if (status === "low") return "warning" as const;
  return "success" as const;
}

export function InventoryPage() {
  const t = useTranslation();
  const guidance = useCrudPageGuidance("inventory");
  const { canUpdate } = useCrudPermissions(PERMISSIONS.MANAGE_PRODUCT_INVENTORY);
  const {
    rows,
    summary,
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
    exportCsv,
    isExportingCsv,
  } = useInventoryList();

  const { getRowValues, updateField, isSaving } = useInventoryInlineUpdate({
    onSuccess: refetch,
  });

  const [viewingRow, setViewingRow] = useState<InventoryVariantRow | null>(null);

  const rowActions = useMemo<CrudRowAction<InventoryVariantRow>[]>(
    () => [
      {
        id: "view",
        label: t.viewAction,
        icon: Eye,
        onSelect: (row) => setViewingRow(row),
      },
    ],
    [t.viewAction],
  );

  const columns = useMemo(
    () => [
      {
        id: "product",
        hideable: false,
        header: t.product,
        cell: (row: InventoryVariantRow) => (
          <CrudEntityNameCell
            imageUrl={getInventoryRowImage(row)}
            placeholder="📦"
            onClick={() => setViewingRow(row)}
          >
            <div>
              <p className="font-medium text-foreground">{row.product.title}</p>
              <p className="text-xs text-muted-foreground">{getVariantDisplayLabel(row.variant)}</p>
            </div>
          </CrudEntityNameCell>
        ),
      },
      {
        id: "brand",
        header: t.brand,
        cell: (row: InventoryVariantRow) => row.product.brand.title,
      },
      {
        id: "sku",
        header: t.skuCode,
        cell: (row: InventoryVariantRow) => (
          <span className="font-mono text-[11px] text-muted-foreground">
            {getInventoryRowSku(row) || "—"}
          </span>
        ),
      },
      {
        id: "price",
        header: t.price,
        cell: (row: InventoryVariantRow) => {
          const { price } = getRowValues(row);

          return (
            <InventoryInlineNumberCell
              value={price}
              displayValue={formatKwd(price)}
              canEdit={canUpdate}
              disabled={isSaving(row.id)}
              min={0}
              step={0.1}
              ariaLabel={t.price}
              editHint={t.inventoryClickToEdit}
              cancelLabel={t.cancel}
              onSave={(nextValue) => updateField(row, "price", nextValue)}
            />
          );
        },
      },
      {
        id: "stock",
        header: t.stock,
        cell: (row: InventoryVariantRow) => {
          const { stock, stockStatus } = getRowValues(row);
          const statusLabel =
            stockStatus === "out"
              ? t.outOfStock
              : stockStatus === "low"
                ? t.lowStockCount
                : t.inStock;

          return (
            <div className="flex items-center gap-2">
              <InventoryInlineNumberCell
                value={stock}
                displayValue={String(stock)}
                canEdit={canUpdate}
                disabled={isSaving(row.id)}
                min={0}
                step={1}
                integer
                showSteppers
                ariaLabel={t.stock}
                editHint={t.inventoryClickToEdit}
                cancelLabel={t.cancel}
                onSave={(nextValue) => updateField(row, "stock", nextValue)}
              />
              <StatusBadge label={statusLabel} variant={stockBadgeVariant(stockStatus)} />
            </div>
          );
        },
      },
    ],
    [canUpdate, getRowValues, isSaving, t, updateField],
  );

  return (
    <CrudListPage
      {...guidance.pageProps}
      title={t.inventory}
      description={t.inventoryPageDescription}
    >
      <InventoryStatsGrid
        summary={summary}
        activeStockStatus={filters.values[INVENTORY_STOCK_STATUS_FILTER_ID] ?? ""}
        onSelectStockStatus={(status) => {
          filters.setFilter(INVENTORY_STOCK_STATUS_FILTER_ID, status || CRUD_FILTER_ALL_VALUE);
        }}
      />

      <CrudListSection>
        <CrudListTable
          guidanceAnchors={{
            search: guidance.searchDataGuidance,
            filters: guidance.filtersDataGuidance,
            rowActions: guidance.rowActionsDataGuidance,
          }}
          tableId="inventory"
          onExportCsv={exportCsv}
          isExportingCsv={isExportingCsv}
          search={{
            value: search,
            onChange: setSearch,
            onReset: resetSearch,
            placeholder: t.searchInventory,
          }}
          filters={{
            definitions: filterDefinitions,
            values: filters.values,
            onChange: filters.setFilter,
            onReset: filters.resetFilters,
            hasActiveFilters: filters.hasActiveFilters,
          }}
          columns={columns}
          data={rows}
          isLoading={isLoading}
          isError={isError}
          errorTitle={t.errorStateDefaultTitle}
          errorDescription={resolveServiceErrorMessage(error, t)}
          retryLabel={t.tryAgain}
          onRetry={() => void refetch()}
          emptyTitle={t.noData}
          emptyDescription={t.emptyStateDefaultDescription}
          rowActions={(row) => (
            <CrudTableActions entity={row} actions={rowActions} ariaLabel={t.actions} />
          )}
          actionsHeader={t.actions}
          caption={t.inventory}
          showingLabel={`${t.showing} ${rows.length} ${t.of} ${total} ${t.results}`}
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

      <InventoryItemViewDialog
        open={viewingRow != null}
        row={viewingRow}
        onOpenChange={(open) => {
          if (!open) setViewingRow(null);
        }}
      />
    </CrudListPage>
  );
}
