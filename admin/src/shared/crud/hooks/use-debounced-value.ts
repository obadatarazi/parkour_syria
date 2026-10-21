import { useEffect, useState } from "react";

import { CRUD_SEARCH_DEBOUNCE_MS } from "@/shared/crud/constants/crud.constants";

export function useDebouncedValue<T>(value: T, delay = CRUD_SEARCH_DEBOUNCE_MS): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
