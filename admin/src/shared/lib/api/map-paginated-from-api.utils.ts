import type { LaravelPaginatedResponse } from "@/shared/lib/api/laravel.types";
import { mapLaravelPagination } from "@/shared/lib/api/laravel.utils";
import type { PaginatedResult } from "@/shared/types";

export function mapPaginatedFromApi<T>(
  response: LaravelPaginatedResponse<T>,
  mapItem: (item: T) => T,
): PaginatedResult<T> {
  const paginated = mapLaravelPagination(response);
  return {
    ...paginated,
    data: paginated.data.map(mapItem),
  };
}
