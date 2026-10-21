import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router";

type UseOpenEntityFromUrlOptions<TEntity> = {
  /** Query key that holds the entity id. Default: `id`. */
  idParam?: string;
  /** Extra query keys to clear after opening (e.g. `productId`). */
  clearParams?: string[];
  /**
   * Build the entity stub passed to `openView`.
   * Default: `{ id }` — enough when the page loads details via getById.
   */
  buildEntity?: (id: number, params: URLSearchParams) => TEntity | null;
};

/**
 * Opens a CRUD view dialog when the URL has `?id=` (used by notification deep-links).
 * Clears the query params after opening so closing the dialog does not reopen it.
 */
export function useOpenEntityFromUrl<TEntity extends { id: number }>(
  openView: (entity: TEntity) => void,
  options: UseOpenEntityFromUrlOptions<TEntity> = {},
): void {
  const { idParam = "id", clearParams = [], buildEntity } = options;
  const [searchParams, setSearchParams] = useSearchParams();
  const openViewRef = useRef(openView);
  openViewRef.current = openView;
  const buildEntityRef = useRef(buildEntity);
  buildEntityRef.current = buildEntity;
  const clearParamsRef = useRef(clearParams);
  clearParamsRef.current = clearParams;
  const openedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const rawId = searchParams.get(idParam)?.trim();
    if (!rawId) {
      openedKeyRef.current = null;
      return;
    }

    const id = Number(rawId);
    if (!Number.isFinite(id) || id <= 0) return;

    const extras = clearParamsRef.current
      .map((key) => searchParams.get(key) ?? "")
      .join(":");
    const openKey = `${idParam}:${rawId}:${extras}`;
    if (openedKeyRef.current === openKey) return;

    const entity = buildEntityRef.current
      ? buildEntityRef.current(id, searchParams)
      : ({ id } as TEntity);

    if (!entity) return;

    openedKeyRef.current = openKey;
    openViewRef.current(entity);

    const next = new URLSearchParams(searchParams);
    next.delete(idParam);
    for (const key of clearParamsRef.current) {
      next.delete(key);
    }
    setSearchParams(next, { replace: true });
  }, [idParam, searchParams, setSearchParams]);
}
