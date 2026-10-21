import { useCallback, useEffect, useRef, useState } from "react";

import {
  DEFAULT_QUERY_STALE_TIME_MS,
  getCachedQueryData,
  isQueryCacheStale,
  runExclusiveQuery,
  setCachedQueryData,
} from "@/shared/crud/query-cache";
import type { CrudQueryState } from "@/shared/crud/types/crud.types";
import { useLocalization } from "@/shared/design-system/localization/contexts/LocalizationContext";

type UseCrudQueryOptions<T> = {
  queryKey: string[];
  /** Receives an AbortSignal so callers can cancel in-flight API work. Extra args are ignored by zero-arg lambdas. */
  queryFn: (signal?: AbortSignal) => Promise<T>;
  enabled?: boolean;
  staleTime?: number;
};

function isAbortError(error: unknown): boolean {
  if (error instanceof DOMException && error.name === "AbortError") return true;
  if (error instanceof Error && error.name === "AbortError") return true;
  return false;
}

export function useCrudQuery<T>({
  queryKey,
  queryFn,
  enabled = true,
  staleTime = DEFAULT_QUERY_STALE_TIME_MS,
}: UseCrudQueryOptions<T>): CrudQueryState<T> {
  const { language } = useLocalization();
  const scopedQueryKey = [...queryKey, language];
  const queryKeySignature = scopedQueryKey.join(":");

  const [data, setData] = useState<T | undefined>(() => getCachedQueryData<T>(scopedQueryKey));
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<CrudQueryState<T>["status"]>(() =>
    getCachedQueryData<T>(scopedQueryKey) ? "success" : "idle",
  );
  const [isFetching, setIsFetching] = useState(false);

  const queryFnRef = useRef(queryFn);
  queryFnRef.current = queryFn;

  const queryKeyRef = useRef(scopedQueryKey);
  queryKeyRef.current = scopedQueryKey;

  const staleTimeRef = useRef(staleTime);
  staleTimeRef.current = staleTime;

  const requestIdRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const patchData = useCallback((updater: (previous: T) => T) => {
    setData((current) => {
      if (current === undefined) return current;
      const next = updater(current);
      setCachedQueryData(queryKeyRef.current, next);
      return next;
    });
  }, []);

  const fetchData = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!enabled) return;

      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const requestId = ++requestIdRef.current;
      const requestQueryKey = queryKeyRef.current;

      const hasData = getCachedQueryData<T>(requestQueryKey) !== undefined;
      const silent = options?.silent ?? hasData;

      if (!silent) {
        setStatus("pending");
      } else {
        setIsFetching(true);
      }
      setError(null);

      try {
        const result = await runExclusiveQuery(requestQueryKey, () =>
          queryFnRef.current(controller.signal),
        );

        setCachedQueryData(requestQueryKey, result);

        // A newer fetch (or unmount abort) superseded this request.
        if (requestId !== requestIdRef.current || controller.signal.aborted) {
          return;
        }

        setData(result);
        setStatus("success");
      } catch (caughtError) {
        if (
          requestId !== requestIdRef.current ||
          controller.signal.aborted ||
          isAbortError(caughtError)
        ) {
          return;
        }

        setError(caughtError instanceof Error ? caughtError : new Error("Request failed"));
        setStatus("error");
      } finally {
        if (requestId === requestIdRef.current) {
          setIsFetching(false);
        }
      }
    },
    [enabled],
  );

  const refetch = useCallback(async () => {
    await fetchData({ silent: data !== undefined });
  }, [data, fetchData]);

  useEffect(() => {
    if (!enabled) {
      setStatus("idle");
      return;
    }

    const cached = getCachedQueryData<T>(scopedQueryKey);

    if (cached !== undefined) {
      setData(cached);
      setStatus("success");
      setError(null);

      // Fresh cache: skip network until staleTime expires (or refetch / key change).
      if (!isQueryCacheStale(scopedQueryKey, staleTimeRef.current)) {
        return;
      }

      void fetchData({ silent: true });
      return;
    }

    setData(undefined);
    void fetchData({ silent: false });
  }, [enabled, fetchData, queryKeySignature]);

  useEffect(() => {
    return () => {
      requestIdRef.current += 1;
    };
  }, []);

  return {
    data,
    error,
    status,
    isLoading: data === undefined && (status === "pending" || status === "idle"),
    isFetching,
    isError: status === "error",
    isSuccess: status === "success",
    refetch,
    patchData,
  };
}
