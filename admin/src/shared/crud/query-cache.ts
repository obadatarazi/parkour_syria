type QueryCacheEntry<T> = {
  data: T;
  updatedAt: number;
};

type QueryCacheInvalidateListener = (prefix: string | undefined) => void;

const queryCache = new Map<string, QueryCacheEntry<unknown>>();
const invalidateListeners = new Set<QueryCacheInvalidateListener>();

export const DEFAULT_QUERY_STALE_TIME_MS = 5 * 60 * 1000;

/** Notify when `invalidateQueryCache` runs (e.g. sidebar badges that stay mounted). */
export function subscribeQueryCacheInvalidation(
  listener: QueryCacheInvalidateListener,
): () => void {
  invalidateListeners.add(listener);
  return () => {
    invalidateListeners.delete(listener);
  };
}

export function getQueryCacheKey(queryKey: readonly string[]): string {
  return queryKey.join(":");
}

export function getCachedQueryData<T>(queryKey: readonly string[]): T | undefined {
  const entry = queryCache.get(getQueryCacheKey(queryKey));
  return entry?.data as T | undefined;
}

export function setCachedQueryData<T>(queryKey: readonly string[], data: T): void {
  queryCache.set(getQueryCacheKey(queryKey), {
    data,
    updatedAt: Date.now(),
  });
}

export function isQueryCacheStale(
  queryKey: readonly string[],
  staleTime = DEFAULT_QUERY_STALE_TIME_MS,
): boolean {
  const entry = queryCache.get(getQueryCacheKey(queryKey));
  if (!entry) return true;
  return Date.now() - entry.updatedAt > staleTime;
}

export function invalidateQueryCache(
  queryKeyPrefix?: string,
  options?: { skipPrefix?: string },
): void {
  if (!queryKeyPrefix) {
    queryCache.clear();
    for (const listener of invalidateListeners) {
      listener(undefined);
    }
    return;
  }

  const prefix = `${queryKeyPrefix}:`;
  const skipPrefix = options?.skipPrefix;
  for (const key of queryCache.keys()) {
    if (skipPrefix && key.startsWith(skipPrefix)) {
      continue;
    }
    if (key === queryKeyPrefix || key.startsWith(prefix)) {
      queryCache.delete(key);
    }
  }

  for (const listener of invalidateListeners) {
    listener(queryKeyPrefix);
  }
}

const inflightQueries = new Map<string, Promise<unknown>>();

export function runExclusiveQuery<T>(
  queryKey: readonly string[],
  factory: () => Promise<T>,
): Promise<T> {
  const key = getQueryCacheKey(queryKey);
  const existing = inflightQueries.get(key);
  if (existing) {
    return existing as Promise<T>;
  }

  const promise = factory().finally(() => {
    if (inflightQueries.get(key) === promise) {
      inflightQueries.delete(key);
    }
  });
  inflightQueries.set(key, promise);
  return promise;
}

export function patchCachedQueryData<T>(
  queryKey: readonly string[],
  updater: (previous: T) => T,
): void {
  const current = getCachedQueryData<T>(queryKey);
  if (current === undefined) return;
  setCachedQueryData(queryKey, updater(current));
}
