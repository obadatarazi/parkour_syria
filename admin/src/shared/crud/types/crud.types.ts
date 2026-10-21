import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type CrudAsyncStatus = "idle" | "pending" | "success" | "error";

export type CrudSaveResult = "saved" | "skipped";

/** Discriminated result from `useCrudMutation.mutate` — works for void deletes too. */
export type CrudMutationSuccess<TData> = { ok: true; data: TData };
export type CrudMutationFailure = { ok: false; error: Error };
export type CrudMutationResult<TData> = CrudMutationSuccess<TData> | CrudMutationFailure;

export function isCrudMutationSuccess<TData>(
  result: CrudMutationResult<TData>,
): result is CrudMutationSuccess<TData> {
  return result.ok;
}

export type CrudQueryState<T> = {
  data: T | undefined;
  error: Error | null;
  status: CrudAsyncStatus;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  isSuccess: boolean;
  refetch: () => Promise<void>;
  patchData: (updater: (previous: T) => T) => void;
};

export type CrudMutationState<TData = unknown, TVariables = void> = {
  mutate: (variables: TVariables) => Promise<CrudMutationResult<TData>>;
  reset: () => void;
  data: TData | undefined;
  error: Error | null;
  status: CrudAsyncStatus;
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
};

export type CrudPaginationState = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  resetPage: () => void;
};

export type CrudSearchState = {
  search: string;
  debouncedSearch: string;
  setSearch: (value: string) => void;
  resetSearch: () => void;
  hasSearch: boolean;
};

export type CrudFilterOption = {
  value: string;
  label: string;
};

export type CrudFilterDefinition = {
  id: string;
  label: string;
  options: CrudFilterOption[];
  allLabel?: string;
  /** Visible in the toolbar row. Unmarked filters use the first filter as primary. */
  primary?: boolean;
};

export type CrudSortDefinition = {
  id: string;
  label: string;
  options: CrudFilterOption[];
};

export type CrudFilterValues = Record<string, string>;

export type CrudFiltersState = {
  values: CrudFilterValues;
  setFilter: (filterId: string, value: string) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
};

export type CrudSelectionState<TId extends string | number = string | number> = {
  selectedIds: TId[];
  setSelectedIds: (ids: TId[]) => void;
  clearSelection: () => void;
  hasSelection: boolean;
};

export type CrudEmptyVariant =
  | "no-records"
  | "no-search-results"
  | "no-filter-results"
  | "permission-denied"
  | "first-time";

export type CrudDialogMode = "create" | "edit" | "view" | "delete" | null;

export type CrudDialogState<TEntity = unknown> = {
  mode: CrudDialogMode;
  entity: TEntity | null;
  openCreate: () => void;
  openEdit: (entity: TEntity) => void;
  openView: (entity: TEntity) => void;
  openDelete: (entity: TEntity) => void;
  close: () => void;
  isOpen: boolean;
};

export type CrudRowAction<TEntity> = {
  id: string;
  label: string;
  icon?: LucideIcon;
  variant?: "default" | "destructive";
  onSelect: (entity: TEntity) => void;
  permission?: string;
  hidden?: boolean;
  disabled?: boolean;
};

export type CrudListQueryParams = {
  page: number;
  pageSize: number;
  search: string;
  filters: CrudFilterValues;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
};

export type CrudServiceResult<T> = {
  data: T;
  total?: number;
};

export type CrudMutationFeedback = {
  successMessage?: string;
  successDescription?: string;
  errorMessage: string;
  errorDescription?: string;
  loadingMessage?: string;
};

export type CrudEmptyStateContent = {
  title: string;
  description?: string;
  action?: ReactNode;
};
