import type { BulkDeleteApiResult } from "@/shared/lib/api/bulk-delete";

export type CrudBulkMutationResult = {
  succeededIds: Array<string | number>;
  failedIds: Array<string | number>;
  errors: Array<{ id: string | number; error: Error }>;
};

export function createEmptyBulkMutationResult(): CrudBulkMutationResult {
  return {
    succeededIds: [],
    failedIds: [],
    errors: [],
  };
}

export function collectSettledBulkResults<TId extends string | number>(
  ids: TId[],
  settled: PromiseSettledResult<unknown>[],
): CrudBulkMutationResult {
  const result = createEmptyBulkMutationResult();

  settled.forEach((entry, index) => {
    const id = ids[index];
    if (entry.status === "fulfilled") {
      result.succeededIds.push(id);
      return;
    }

    const error =
      entry.reason instanceof Error ? entry.reason : new Error(String(entry.reason ?? "Request failed"));
    result.failedIds.push(id);
    result.errors.push({ id, error });
  });

  return result;
}

/**
 * Maps a successful bulk-delete response onto the table selection result.
 * Ids the API could not find are treated as succeeded — the row is already gone.
 */
export function mapBulkDeleteApiResult(
  requestedIds: Array<string | number>,
  apiResult: BulkDeleteApiResult,
  error?: Error,
): CrudBulkMutationResult {
  const deletedOrGone = new Set(
    [...apiResult.deletedIds, ...apiResult.notFoundIds].map(String),
  );
  const result = createEmptyBulkMutationResult();

  requestedIds.forEach((id) => {
    if (deletedOrGone.has(String(id))) {
      result.succeededIds.push(id);
      return;
    }

    result.failedIds.push(id);
    result.errors.push({
      id,
      error: error ?? new Error("Not deleted"),
    });
  });

  return result;
}

export function allIdsFailed(
  ids: Array<string | number>,
  error: Error,
): CrudBulkMutationResult {
  return {
    succeededIds: [],
    failedIds: [...ids],
    errors: ids.map((id) => ({ id, error })),
  };
}
