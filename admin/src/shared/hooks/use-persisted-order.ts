import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_PREFIX = "aroma-widget-order:";

function readStoredOrder(storageKey: string): string[] | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${storageKey}`);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.some((id) => typeof id !== "string")) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function writeStoredOrder(storageKey: string, order: string[]): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}${storageKey}`, JSON.stringify(order));
  } catch {
    // Ignore quota / private-mode failures.
  }
}

export function normalizeOrder(stored: string[] | null, defaultIds: string[]): string[] {
  const allowed = new Set(defaultIds);
  const seen = new Set<string>();
  const next: string[] = [];

  for (const id of stored ?? []) {
    if (!allowed.has(id) || seen.has(id)) continue;
    seen.add(id);
    next.push(id);
  }

  for (const id of defaultIds) {
    if (seen.has(id)) continue;
    next.push(id);
  }

  return next;
}

export function reorderIds(order: string[], fromId: string, toId: string): string[] {
  if (fromId === toId) return order;

  const next = [...order];
  const fromIndex = next.indexOf(fromId);
  const toIndex = next.indexOf(toId);
  if (fromIndex < 0 || toIndex < 0) return order;

  const displaced = next[toIndex];
  next[toIndex] = next[fromIndex];
  next[fromIndex] = displaced;
  return next;
}

function ordersEqual(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((id, index) => id === right[index]);
}

export function usePersistedOrder(storageKey: string, defaultIds: string[]) {
  const defaultIdsKey = defaultIds.join("\0");
  const stableDefaultIds = useMemo(
    () => (defaultIdsKey ? defaultIdsKey.split("\0") : []),
    [defaultIdsKey],
  );

  const [order, setOrder] = useState<string[]>(() =>
    normalizeOrder(readStoredOrder(storageKey), stableDefaultIds),
  );

  useEffect(() => {
    setOrder(normalizeOrder(readStoredOrder(storageKey), stableDefaultIds));
  }, [stableDefaultIds, storageKey]);

  useEffect(() => {
    if (stableDefaultIds.length === 0) return;
    writeStoredOrder(storageKey, order);
  }, [order, stableDefaultIds.length, storageKey]);

  const moveTo = useCallback((fromId: string, toId: string) => {
    setOrder((current) => reorderIds(current, fromId, toId));
  }, []);

  const moveByOffset = useCallback((id: string, delta: number) => {
    setOrder((current) => {
      const fromIndex = current.indexOf(id);
      if (fromIndex < 0) return current;

      const toIndex = Math.max(0, Math.min(current.length - 1, fromIndex + delta));
      if (toIndex === fromIndex) return current;

      return reorderIds(current, id, current[toIndex]);
    });
  }, []);

  const reset = useCallback(() => {
    setOrder([...stableDefaultIds]);
  }, [stableDefaultIds]);

  const isCustomized = !ordersEqual(order, stableDefaultIds);

  return {
    order,
    moveTo,
    moveByOffset,
    reset,
    isCustomized,
  };
}
