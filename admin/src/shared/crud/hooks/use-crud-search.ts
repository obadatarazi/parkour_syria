import { useCallback, useState } from "react";

import { useDebouncedValue } from "@/shared/crud/hooks/use-debounced-value";
import type { CrudSearchState } from "@/shared/crud/types/crud.types";

export function useCrudSearch(initialValue = ""): CrudSearchState {
  const [search, setSearchState] = useState(initialValue);
  const debouncedSearch = useDebouncedValue(search);

  const setSearch = useCallback((value: string) => {
    setSearchState(value);
  }, []);

  const resetSearch = useCallback(() => {
    setSearchState("");
  }, []);

  return {
    search,
    debouncedSearch,
    setSearch,
    resetSearch,
    hasSearch: debouncedSearch.trim().length > 0,
  };
}
