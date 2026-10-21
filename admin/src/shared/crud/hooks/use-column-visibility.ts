import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_PREFIX = "aroma-table-columns:";

type ColumnVisibilityMap = Record<string, boolean>;

function readStoredVisibility(tableId: string): ColumnVisibilityMap | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${tableId}`);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);

    // Legacy format: string[] of visible ids
    if (Array.isArray(parsed) && parsed.every((id) => typeof id === "string")) {
      return Object.fromEntries(parsed.map((id) => [id, true]));
    }

    if (
      parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed) &&
      Object.values(parsed).every((value) => typeof value === "boolean")
    ) {
      return parsed as ColumnVisibilityMap;
    }

    return null;
  } catch {
    return null;
  }
}

function writeStoredVisibility(tableId: string, visibility: ColumnVisibilityMap): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}${tableId}`, JSON.stringify(visibility));
  } catch {
    // Ignore quota / private-mode failures.
  }
}

function buildVisibilityMap(
  columnIds: string[],
  stored: ColumnVisibilityMap | null,
  defaultHiddenIds: ReadonlySet<string>,
): ColumnVisibilityMap {
  const next: ColumnVisibilityMap = {};

  for (const id of columnIds) {
    if (stored && Object.prototype.hasOwnProperty.call(stored, id)) {
      next[id] = stored[id] === true;
    } else {
      next[id] = !defaultHiddenIds.has(id);
    }
  }

  // Guarantee at least one visible column.
  if (columnIds.length > 0 && !columnIds.some((id) => next[id])) {
    next[columnIds[0]] = true;
  }

  return next;
}

function toVisibleIds(columnIds: string[], visibility: ColumnVisibilityMap): string[] {
  return columnIds.filter((id) => visibility[id]);
}

export type UseColumnVisibilityOptions = {
  tableId: string;
  columnIds: string[];
  /** Column ids hidden by default until the admin turns them on. */
  defaultHiddenIds?: string[];
  enabled?: boolean;
};

export type UseColumnVisibilityResult = {
  visibleColumnIds: string[];
  isColumnVisible: (columnId: string) => boolean;
  toggleColumn: (columnId: string) => void;
  resetColumns: () => void;
  hasHiddenColumns: boolean;
};

export function useColumnVisibility({
  tableId,
  columnIds,
  defaultHiddenIds = [],
  enabled = true,
}: UseColumnVisibilityOptions): UseColumnVisibilityResult {
  const columnIdsKey = columnIds.join("\0");
  const defaultHiddenKey = defaultHiddenIds.join("\0");

  const defaultHiddenSet = useMemo(
    () => new Set(defaultHiddenKey ? defaultHiddenKey.split("\0") : []),
    [defaultHiddenKey],
  );

  const stableColumnIds = useMemo(
    () => (columnIdsKey ? columnIdsKey.split("\0") : []),
    [columnIdsKey],
  );

  const [visibility, setVisibility] = useState<ColumnVisibilityMap>(() => {
    if (!enabled || stableColumnIds.length === 0) {
      return Object.fromEntries(stableColumnIds.map((id) => [id, true]));
    }
    return buildVisibilityMap(
      stableColumnIds,
      readStoredVisibility(tableId),
      defaultHiddenSet,
    );
  });

  useEffect(() => {
    if (!enabled) {
      setVisibility(Object.fromEntries(stableColumnIds.map((id) => [id, true])));
      return;
    }

    setVisibility(
      buildVisibilityMap(stableColumnIds, readStoredVisibility(tableId), defaultHiddenSet),
    );
  }, [defaultHiddenSet, enabled, stableColumnIds, tableId]);

  useEffect(() => {
    if (!enabled || stableColumnIds.length === 0) return;
    writeStoredVisibility(tableId, visibility);
  }, [enabled, stableColumnIds.length, tableId, visibility]);

  const visibleColumnIds = useMemo(
    () => toVisibleIds(stableColumnIds, visibility),
    [stableColumnIds, visibility],
  );

  const isColumnVisible = useCallback(
    (columnId: string) => visibility[columnId] === true,
    [visibility],
  );

  const toggleColumn = useCallback(
    (columnId: string) => {
      if (!enabled || !stableColumnIds.includes(columnId)) return;

      setVisibility((current) => {
        const currentlyVisible = current[columnId] === true;
        if (currentlyVisible) {
          const visibleCount = stableColumnIds.filter((id) => current[id]).length;
          if (visibleCount <= 1) return current;
          return { ...current, [columnId]: false };
        }
        return { ...current, [columnId]: true };
      });
    },
    [enabled, stableColumnIds],
  );

  const resetColumns = useCallback(() => {
    const next = buildVisibilityMap(stableColumnIds, null, defaultHiddenSet);
    setVisibility(next);
    if (enabled) {
      writeStoredVisibility(tableId, next);
    }
  }, [defaultHiddenSet, enabled, stableColumnIds, tableId]);

  const hasHiddenColumns = visibleColumnIds.length < stableColumnIds.length;

  return {
    visibleColumnIds,
    isColumnVisible,
    toggleColumn,
    resetColumns,
    hasHiddenColumns,
  };
}
