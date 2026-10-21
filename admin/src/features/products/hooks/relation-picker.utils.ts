import { useMemo } from "react";

import type { RelationPickerSeed } from "@/features/products/types/products.types";

export function relationSeedToLabelItem<T extends { id: number; title: string; translations?: RelationPickerSeed["translations"] }>(
  seed: RelationPickerSeed,
): T {
  return {
    id: seed.id,
    title: seed.title,
    ...(seed.translations ? { translations: seed.translations } : {}),
  } as T;
}

export function buildRelationPickerSeedMap(
  seeds: RelationPickerSeed[],
): Map<number, RelationPickerSeed> {
  return new Map(seeds.map((seed) => [seed.id, seed]));
}

export function getMissingRelationPickerIds(
  selectedIds: number[],
  knownItems: Map<number, RelationPickerSeed>,
): number[] {
  return selectedIds.filter((id) => !knownItems.has(id));
}

export function resolveRelationPickerItems<T extends RelationPickerSeed>(
  selectedIds: number[],
  knownItems: Map<number, RelationPickerSeed>,
): T[] {
  return selectedIds
    .map((id) => knownItems.get(id))
    .filter((item): item is RelationPickerSeed => item != null) as T[];
}

export function useRelationPickerKnownItems(
  seedItems: RelationPickerSeed[],
  pickedItems: RelationPickerSeed[],
  fetchedItems: RelationPickerSeed[] = [],
): Map<number, RelationPickerSeed> {
  return useMemo(() => {
    const map = new Map<number, RelationPickerSeed>();
    for (const item of [...seedItems, ...pickedItems, ...fetchedItems]) {
      map.set(item.id, item);
    }
    return map;
  }, [seedItems, pickedItems, fetchedItems]);
}
