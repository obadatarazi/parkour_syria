import { type ReactNode,useMemo } from "react";

import { DataTable } from "@/shared/components/data/DataTable";
import type { DataTableColumn, DataTablePagination } from "@/shared/components/data/DataTable.types";
import { CrudColumnVisibilityMenu } from "@/shared/crud/components/CrudColumnVisibilityMenu";
import { CrudExportMenu } from "@/shared/crud/components/CrudExportMenu";
import {
  CrudTableControls,
  type CrudTableControlsFiltersProps,
  type CrudTableControlsSearchProps,
  type CrudTableControlsSortProps,
} from "@/shared/crud/components/CrudTableControls";
import { useColumnVisibility } from "@/shared/crud/hooks/use-column-visibility";
import { cn } from "@/shared/design-system/components/ui/utils";

type CrudListTableProps<T extends { id: string | number }> = {
  /** Stable id used to persist column visibility per table (e.g. "products"). */
  tableId?: string;
  /** When false, hides the Columns view-options menu even if tableId is set. Defaults to true. */
  enableColumnVisibility?: boolean;
  search?: CrudTableControlsSearchProps;
  filters?: CrudTableControlsFiltersProps;
  sort?: CrudTableControlsSortProps;
  toolbarActions?: ReactNode;
  onExportCsv?: () => void;
  isExportingCsv?: boolean;
  /** Applies data-guidance anchors to search / filters / first row actions. */
  guidanceAnchors?: {
    search?: string;
    filters?: string;
    rowActions?: string;
  };
  columns: DataTableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  isError?: boolean;
  retryLabel?: string;
  errorTitle?: string;
  errorDescription?: string;
  onRetry?: () => void;
  emptyTitle: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  enableSelection?: boolean;
  selectedIds?: Array<string | number>;
  onSelectionChange?: (ids: Array<string | number>) => void;
  selectAllLabel?: string;
  rowActions?: (row: T) => ReactNode;
  actionsHeader?: ReactNode;
  pagination?: DataTablePagination;
  showingLabel?: string;
  caption?: string;
  bulkActions?: ReactNode;
  getRowId?: (row: T) => string | number;
  getRowClassName?: (row: T) => string | undefined;
  getSelectRowLabel?: (rowId: string | number) => string;
  className?: string;
  tableClassName?: string;
};

export function CrudListTable<T extends { id: string | number }>({
  tableId,
  enableColumnVisibility = true,
  search,
  filters,
  sort,
  toolbarActions,
  onExportCsv,
  isExportingCsv = false,
  guidanceAnchors,
  columns,
  className,
  tableClassName,
  rowActions,
  data,
  getRowId,
  ...tableProps
}: CrudListTableProps<T>) {
  const columnVisibilityEnabled = Boolean(tableId) && enableColumnVisibility;

  const columnIds = useMemo(() => columns.map((column) => column.id), [columns]);
  const defaultHiddenIds = useMemo(
    () => columns.filter((column) => column.defaultHidden).map((column) => column.id),
    [columns],
  );

  const { visibleColumnIds, toggleColumn, resetColumns } = useColumnVisibility({
    tableId: tableId ?? "",
    columnIds,
    defaultHiddenIds,
    enabled: columnVisibilityEnabled,
  });

  const visibleColumns = useMemo(() => {
    if (!columnVisibilityEnabled) return columns;

    const visibleSet = new Set(visibleColumnIds);
    return columns.filter(
      (column) => column.hideable === false || visibleSet.has(column.id),
    );
  }, [columnVisibilityEnabled, columns, visibleColumnIds]);

  const columnVisibilityMenu = columnVisibilityEnabled ? (
    <CrudColumnVisibilityMenu
      columns={columns.map((column) => ({
        id: column.id,
        label: column.header,
        hideable: column.hideable,
      }))}
      visibleColumnIds={
        columns
          .filter(
            (column) =>
              column.hideable === false || visibleColumnIds.includes(column.id),
          )
          .map((column) => column.id)
      }
      onToggle={toggleColumn}
      onReset={resetColumns}
    />
  ) : null;

  const resolvedSearch = search
    ? {
        ...search,
        dataGuidance: search.dataGuidance ?? guidanceAnchors?.search,
      }
    : undefined;

  const resolvedFilters = filters
    ? {
        ...filters,
        dataGuidance: filters.dataGuidance ?? guidanceAnchors?.filters,
      }
    : undefined;

  const firstRowId =
    data.length > 0 ? (getRowId ? getRowId(data[0]) : data[0].id) : undefined;

  const resolvedRowActions = rowActions
    ? (row: T) => {
        const content = rowActions(row);
        const rowId = getRowId ? getRowId(row) : row.id;
        if (!guidanceAnchors?.rowActions || rowId !== firstRowId) return content;
        return (
          <div data-guidance={guidanceAnchors.rowActions} className="inline-flex">
            {content}
          </div>
        );
      }
    : undefined;

  const csvExportMenu = onExportCsv ? (
    <CrudExportMenu onExportCsv={onExportCsv} isExporting={isExportingCsv} />
  ) : null;

  const resolvedToolbarActions =
    csvExportMenu || toolbarActions ? (
      <>
        {csvExportMenu}
        {toolbarActions}
      </>
    ) : undefined;

  const hasControls = Boolean(
    resolvedSearch ||
      resolvedFilters ||
      sort ||
      resolvedToolbarActions ||
      columnVisibilityMenu,
  );

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card shadow-sm",
        className,
      )}
    >
      {hasControls ? (
        <CrudTableControls
          search={resolvedSearch}
          filters={resolvedFilters}
          sort={sort}
          toolbarActions={resolvedToolbarActions}
          trailingActions={columnVisibilityMenu}
        />
      ) : null}
      <DataTable
        {...tableProps}
        data={data}
        getRowId={getRowId}
        rowActions={resolvedRowActions}
        columns={visibleColumns}
        tableClassName={tableClassName}
        className="rounded-none border-0 shadow-none"
      />
    </div>
  );
}
