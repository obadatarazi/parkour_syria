import { CRUD_FILTER_ALL_VALUE } from "@/shared/crud/constants/crud.constants";
import type { CrudFilterDefinition, CrudFilterValues } from "@/shared/crud/types/crud.types";

export function splitFilterDefinitions(filters: CrudFilterDefinition[]) {
  const markedPrimary = filters.filter((filter) => filter.primary);
  const primary =
    markedPrimary.length > 0 ? markedPrimary : filters.length > 0 ? [filters[0]] : [];
  const primaryIds = new Set(primary.map((filter) => filter.id));
  const secondary = filters.filter((filter) => !primaryIds.has(filter.id));

  return { primary, secondary };
}

export function countActiveFiltersForIds(
  filterIds: string[],
  values: CrudFilterValues,
): number {
  return filterIds.filter((id) => isActiveFilterValue(values[id])).length;
}

export function isActiveFilterValue(value: string | undefined): boolean {
  return Boolean(value && value !== CRUD_FILTER_ALL_VALUE);
}

export function countActiveFilters(filters: CrudFilterValues): number {
  return Object.values(filters).filter(isActiveFilterValue).length;
}

export function applyClientFilters<T>(
  items: T[],
  filters: CrudFilterValues,
  getFilterValue: (item: T, filterId: string) => string,
): T[] {
  const activeEntries = Object.entries(filters).filter(([, value]) => isActiveFilterValue(value));
  if (activeEntries.length === 0) return items;

  return items.filter((item) =>
    activeEntries.every(
      ([filterId, filterValue]) => getFilterValue(item, filterId) === filterValue,
    ),
  );
}

export function createDefaultFilterValues(filterIds: string[]): CrudFilterValues {
  return Object.fromEntries(filterIds.map((id) => [id, CRUD_FILTER_ALL_VALUE]));
}

export function mapBooleanFilterValue(value: string | undefined): boolean | undefined {
  if (!isActiveFilterValue(value)) return undefined;
  return value === "true";
}

export function mapStringFilterValue(value: string | undefined): string | undefined {
  if (!isActiveFilterValue(value)) return undefined;
  return value;
}

export function mapIntegerFilterValue(value: string | undefined): number | undefined {
  if (!isActiveFilterValue(value)) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/** Drop empty / "all" filter values so they never reach the request URL. */
export function sanitizeFilterParams(
  params: Record<string, string | number | boolean | undefined>,
): Record<string, string | number | boolean> {
  const result: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    if (typeof value === "string" && value === CRUD_FILTER_ALL_VALUE) continue;
    if (typeof value === "number" && !Number.isFinite(value)) continue;
    result[key] = value;
  }

  return result;
}

export type LaravelSortParams = {
  sort?: string;
  direction?: "asc" | "desc";
};

export function parseSortParam(value: string | undefined): LaravelSortParams {
  if (!value || !value.includes(":")) return {};
  const [sort, direction] = value.split(":");
  if (!sort || (direction !== "asc" && direction !== "desc")) return {};
  return { sort, direction };
}
