export function normalizeSearchQuery(query: string): string {
  return query.trim().toLowerCase();
}

export function matchesSearchQuery(value: string, query: string): boolean {
  const normalizedQuery = normalizeSearchQuery(query);
  if (!normalizedQuery) return true;
  return value.toLowerCase().includes(normalizedQuery);
}

export function applyClientSearch<T>(
  items: T[],
  query: string,
  getSearchableValues: (item: T) => string[],
): T[] {
  const normalizedQuery = normalizeSearchQuery(query);
  if (!normalizedQuery) return items;

  return items.filter((item) =>
    getSearchableValues(item).some((value) => matchesSearchQuery(value, normalizedQuery)),
  );
}
