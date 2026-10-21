import { useSearchParams } from "react-router";

/**
 * Reads a trimmed query-string value once for seeding list search fields.
 */
export function useUrlSearchParam(key = "search"): string {
  const [searchParams] = useSearchParams();
  return searchParams.get(key)?.trim() ?? "";
}
