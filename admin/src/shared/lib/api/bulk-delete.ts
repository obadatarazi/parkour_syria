import { apiRequest } from "@/shared/lib/api/api-client";
import type { LaravelSuccessResponse } from "@/shared/lib/api/laravel.types";

/** Matches `BulkDeleteRequest::MAX_IDS` on the backend. */
export const BULK_DELETE_MAX_IDS = 500;

export type BulkDeleteApiResult = {
  deletedCount: number;
  deletedIds: number[];
  notFoundIds: number[];
};

export function toBulkDeleteIds(ids: Array<string | number>): number[] {
  return [
    ...new Set(
      ids
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && id >= 1),
    ),
  ];
}

/**
 * Deletes a selection in one POST. Unknown ids come back in `notFoundIds` and do not
 * fail the call — the rows that were found are removed in a single transaction.
 */
export async function postBulkDelete(
  path: string,
  ids: Array<string | number>,
): Promise<BulkDeleteApiResult> {
  const numericIds = toBulkDeleteIds(ids);
  if (numericIds.length === 0) {
    return { deletedCount: 0, deletedIds: [], notFoundIds: [] };
  }

  const response = await apiRequest<LaravelSuccessResponse<BulkDeleteApiResult>>(path, {
    method: "POST",
    body: { ids: numericIds },
    timeoutMs: 120_000,
  });

  return {
    deletedCount: response.data.deletedCount,
    deletedIds: response.data.deletedIds,
    notFoundIds: response.data.notFoundIds,
  };
}
