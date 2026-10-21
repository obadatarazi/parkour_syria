import { FILTER_ALL_VALUE } from "@/shared/constants/pagination";
import { ServiceError } from "@/shared/errors";
import { isUnsafeErrorMessage } from "@/shared/errors/is-unsafe-error-message";
import type { PaginatedResult } from "@/shared/types";

import type { LaravelPaginatedResponse } from "./laravel.types";
import { readLaravelApiErrorMessage } from "./read-laravel-api-error";

export function mapLaravelPagination<T>(
  response: LaravelPaginatedResponse<T>,
): PaginatedResult<T> {
  const { pagination } = response;
  const items = Array.isArray(pagination.items)
    ? pagination.items
    : Array.isArray(pagination.items?.data)
      ? pagination.items.data
      : [];

  return {
    data: items,
    total: pagination.totalItems,
    page: pagination.page,
    pageSize: pagination.limit,
    unreadCount:
      typeof response.unreadCount === "number" && Number.isFinite(response.unreadCount)
        ? Math.max(0, response.unreadCount)
        : undefined,
  };
}

export function mapLaravelError(status: number, body: unknown): ServiceError {
  const rawMessage = readLaravelApiErrorMessage(body);
  const message = rawMessage && !isUnsafeErrorMessage(rawMessage) ? rawMessage : undefined;

  if (status === 401) {
    return new ServiceError("invalid_credentials", message);
  }
  if (status === 403) {
    return new ServiceError("permission_denied", message);
  }
  if (status === 404) {
    return new ServiceError("not_found", message);
  }
  if (status >= 500) {
    return new ServiceError("network_error");
  }

  return new ServiceError("unknown", message);
}

export function buildQueryString(
  params?: Record<string, string | number | boolean | undefined | null>,
): string {
  if (!params) return "";

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    if (typeof value === "number" && !Number.isFinite(value)) continue;
    // Never send UI "All" sentinel values (except literal search text).
    if (key !== "search" && value === FILTER_ALL_VALUE) continue;
    searchParams.set(key, String(value));
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

type LaravelListParamsInput = Record<string, string | number | boolean | undefined | null>;

export function buildLaravelListParams(
  params?: LaravelListParamsInput,
  defaults: { page?: number; limit?: number } = {},
): Record<string, string | number | boolean> {
  const result: Record<string, string | number | boolean> = {
    page: params?.page ?? defaults.page ?? 1,
    limit: params?.limit ?? defaults.limit ?? 10,
  };

  for (const [key, value] of Object.entries(params ?? {})) {
    if (key === "page" || key === "limit") continue;
    if (value === undefined || value === null || value === "") continue;
    if (typeof value === "number" && !Number.isFinite(value)) continue;
    if (key !== "search" && value === FILTER_ALL_VALUE) continue;
    result[key] = value;
  }

  return result;
}

/**
 * Same filters/sort/search as a list request, without paging — `GET /export`
 * streams every matching row.
 */
export function buildLaravelExportParams(
  params?: LaravelListParamsInput,
): Record<string, string | number | boolean> {
  const result: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries(params ?? {})) {
    if (key === "page" || key === "limit") continue;
    if (value === undefined || value === null || value === "") continue;
    if (typeof value === "number" && !Number.isFinite(value)) continue;
    if (key !== "search" && value === FILTER_ALL_VALUE) continue;
    result[key] = value;
  }

  return result;
}
