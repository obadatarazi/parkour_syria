import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { type ReactNode } from "react";

import { AppButton } from "@/shared/components/buttons/AppButton";
import {
  type DataTableColumn,
  type DataTablePagination,
} from "@/shared/components/data/DataTable.types";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { ErrorState } from "@/shared/components/feedback/ErrorState";
import { TableSkeleton } from "@/shared/components/feedback/LoadingState";
import { CaptionText } from "@/shared/components/typography/Typography";
import { PAGE_SIZE_OPTIONS } from "@/shared/constants/pagination";
import { Checkbox } from "@/shared/design-system/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/design-system/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/design-system/components/ui/table";
import { cn } from "@/shared/design-system/components/ui/utils";
import {
  useLocalization,
  useTranslation,
} from "@/shared/design-system/localization/contexts/LocalizationContext";

const PAGINATION_ICON_BUTTON_CLASS = "size-6 rounded-lg p-0";

function DataTablePaginationBar({
  pagination,
  showingLabel,
  totalPages,
  className,
}: {
  pagination: DataTablePagination;
  showingLabel?: string;
  totalPages: number;
  className?: string;
}) {
  const t = useTranslation();
  const { direction } = useLocalization();
  const isRtl = direction === "rtl";
  const FirstIcon = isRtl ? ChevronsRight : ChevronsLeft;
  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;
  const LastIcon = isRtl ? ChevronsLeft : ChevronsRight;
  const atFirstPage = pagination.page <= 1;
  const atLastPage = pagination.page >= totalPages;

  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 px-3 py-1.5 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <CaptionText className="text-[11px] leading-none">
        {showingLabel ??
          `Showing ${(pagination.page - 1) * pagination.pageSize + 1}–${Math.min(
            pagination.page * pagination.pageSize,
            pagination.totalItems,
          )} of ${pagination.totalItems}`}
      </CaptionText>
      <div className="flex flex-wrap items-center gap-1">
        {pagination.onPageSizeChange ? (
          <div className="flex items-center gap-1">
            <CaptionText className="text-[11px] leading-none">
              {pagination.pageSizeLabel ?? "Per page"}
            </CaptionText>
            <Select
              value={String(pagination.pageSize)}
              onValueChange={(value) => pagination.onPageSizeChange?.(Number(value))}
            >
              <SelectTrigger
                size="sm"
                className="h-6 w-[3.75rem] rounded-lg px-2 text-[11px]"
                aria-label={pagination.pageSizeLabel ?? "Per page"}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from(
                  new Set([
                    ...(pagination.pageSizeOptions ?? PAGE_SIZE_OPTIONS),
                    pagination.pageSize,
                  ]),
                )
                  .sort((a, b) => a - b)
                  .map((option) => (
                    <SelectItem key={option} value={String(option)} className="text-[11px]">
                      {option}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
        <AppButton
          variant="outline"
          size="icon"
          className={PAGINATION_ICON_BUTTON_CLASS}
          disabled={atFirstPage}
          onClick={() => pagination.onPageChange(1)}
          aria-label={t.firstPage}
        >
          <FirstIcon className="size-3.5" aria-hidden="true" />
        </AppButton>
        <AppButton
          variant="outline"
          size="icon"
          className={PAGINATION_ICON_BUTTON_CLASS}
          disabled={atFirstPage}
          onClick={() => pagination.onPageChange(pagination.page - 1)}
          aria-label={pagination.previousLabel}
        >
          <PrevIcon className="size-3.5" aria-hidden="true" />
        </AppButton>
        <CaptionText className="min-w-[2.5rem] text-center text-[11px] leading-none">
          {pagination.page} / {totalPages}
        </CaptionText>
        <AppButton
          variant="outline"
          size="icon"
          className={PAGINATION_ICON_BUTTON_CLASS}
          disabled={atLastPage}
          onClick={() => pagination.onPageChange(pagination.page + 1)}
          aria-label={pagination.nextLabel}
        >
          <NextIcon className="size-3.5" aria-hidden="true" />
        </AppButton>
        <AppButton
          variant="outline"
          size="icon"
          className={PAGINATION_ICON_BUTTON_CLASS}
          disabled={atLastPage}
          onClick={() => pagination.onPageChange(totalPages)}
          aria-label={t.lastPage}
        >
          <LastIcon className="size-3.5" aria-hidden="true" />
        </AppButton>
      </div>
    </div>
  );
}

type DataTableProps<T extends { id: string | number }> = {
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
  className?: string;
  /**
   * Extra classes for the inner `<table>`.
   * Defaults to fixed layout so columns share width on ~13"+ screens.
   * Pass `table-auto` to opt out.
   */
  tableClassName?: string;
  getRowId?: (row: T) => string | number;
  getRowClassName?: (row: T) => string | undefined;
  getSelectRowLabel?: (rowId: string | number) => string;
};

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  isLoading = false,
  isError = false,
  errorTitle,
  errorDescription,
  onRetry,
  retryLabel,
  emptyTitle,
  emptyDescription,
  emptyAction,
  enableSelection = false,
  selectedIds = [],
  onSelectionChange,
  selectAllLabel = "Select all",
  rowActions,
  actionsHeader,
  pagination,
  showingLabel,
  caption,
  bulkActions,
  className,
  tableClassName,
  getRowId = (row) => row.id,
  getRowClassName,
  getSelectRowLabel,
}: DataTableProps<T>) {
  const rowIds = data.map(getRowId);
  const allSelected = rowIds.length > 0 && rowIds.every((id) => selectedIds.includes(id));
  const someSelected = rowIds.some((id) => selectedIds.includes(id));

  const toggleAll = () => {
    if (!onSelectionChange) return;
    onSelectionChange(allSelected ? [] : rowIds);
  };

  const toggleRow = (id: string | number) => {
    if (!onSelectionChange) return;
    onSelectionChange(
      selectedIds.includes(id)
        ? selectedIds.filter((selectedId) => selectedId !== id)
        : [...selectedIds, id],
    );
  };

  const renderContent = () => {
    if (isLoading && data.length === 0) {
      return (
        <TableSkeleton
          columns={columns.length + (enableSelection ? 1 : 0) + (rowActions ? 1 : 0)}
        />
      );
    }

    if (isError) {
      return (
        <ErrorState
          title={errorTitle ?? ""}
          description={errorDescription}
          action={
            onRetry && retryLabel ? (
              <AppButton variant="outline" onClick={onRetry}>
                {retryLabel}
              </AppButton>
            ) : undefined
          }
        />
      );
    }

    if (data.length === 0) {
      return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />;
    }

    return (
      <Table className={cn("w-full table-fixed", tableClassName)}>
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <TableHeader>
          <TableRow>
            {enableSelection ? (
              <TableHead className="w-10 ps-4 pe-2 text-center align-middle">
                <div className="flex items-center justify-center">
                  <Checkbox
                    checked={allSelected ? true : someSelected ? "indeterminate" : false}
                    onCheckedChange={toggleAll}
                    aria-label={selectAllLabel}
                  />
                </div>
              </TableHead>
            ) : null}
            {columns.map((column) => {
              const SortIcon =
                column.sortDirection === "asc"
                  ? ArrowUp
                  : column.sortDirection === "desc"
                    ? ArrowDown
                    : ArrowUpDown;

              return (
                <TableHead
                  key={column.id}
                  className={cn("min-w-0", column.className, column.headerClassName)}
                >
                  {column.sortable && column.onSort ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-start font-medium transition-colors hover:text-foreground"
                      onClick={column.onSort}
                      aria-label={column.sortLabel ?? `Sort by ${column.id}`}
                    >
                      {column.header}
                      <SortIcon className="size-3.5 text-muted-foreground" aria-hidden="true" />
                    </button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              );
            })}
            {rowActions ? (
              <TableHead className="w-[5.25rem] min-w-[5.25rem] pe-4 ps-2 text-end">
                {actionsHeader}
              </TableHead>
            ) : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => {
            const rowId = getRowId(row);
            return (
              <TableRow
                key={rowId}
                data-state={selectedIds.includes(rowId) ? "selected" : undefined}
                className={cn("group/table-row", getRowClassName?.(row))}
              >
                {enableSelection ? (
                  <TableCell className="w-10 ps-4 pe-2 text-center align-middle">
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={selectedIds.includes(rowId)}
                        onCheckedChange={() => toggleRow(rowId)}
                        aria-label={getSelectRowLabel?.(rowId) ?? String(rowId)}
                      />
                    </div>
                  </TableCell>
                ) : null}
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    className={cn("min-w-0", column.className)}
                  >
                    {column.cell(row)}
                  </TableCell>
                ))}
                {rowActions ? (
                  <TableCell className="w-[5.25rem] min-w-[5.25rem] pe-4 ps-2 text-end align-middle">
                    {rowActions(row)}
                  </TableCell>
                ) : null}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };

  const totalPages = pagination
    ? Math.max(1, Math.ceil(pagination.totalItems / pagination.pageSize))
    : 1;

  const showPagination = Boolean(pagination && !isLoading && !isError && data.length > 0);

  return (
    <div
      className={cn("overflow-hidden rounded-xl border border-border bg-card shadow-sm", className)}
    >
      {bulkActions ? (
        <div className="border-b border-border bg-muted/30 px-4 py-3">{bulkActions}</div>
      ) : null}
      {showPagination && pagination ? (
        <DataTablePaginationBar
          pagination={pagination}
          showingLabel={showingLabel}
          totalPages={totalPages}
          className="border-b border-border"
        />
      ) : null}
      <div className="overflow-x-auto">{renderContent()}</div>
      {showPagination && pagination ? (
        <DataTablePaginationBar
          pagination={pagination}
          showingLabel={showingLabel}
          totalPages={totalPages}
          className="border-t border-border"
        />
      ) : null}
    </div>
  );
}
