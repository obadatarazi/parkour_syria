import { type ReactNode } from "react";

export type DataTableSortDirection = "asc" | "desc" | null;

export type DataTableColumn<T> = {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
  sortable?: boolean;
  sortDirection?: DataTableSortDirection;
  onSort?: () => void;
  sortLabel?: string;
  /** When false, the column is always shown and omitted from view options. Defaults to true. */
  hideable?: boolean;
  /** When true, the column starts hidden until enabled in view options. */
  defaultHidden?: boolean;
};

export type DataTablePagination = {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  /** When provided, shows a page-size selector (10 / 20 / 30 / 50). */
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: readonly number[];
  pageSizeLabel?: string;
  previousLabel: string;
  nextLabel: string;
};
