import { useCallback } from "react";

import { cartsService } from "@/features/carts/services/carts.service";
import type { CartStats } from "@/features/carts/types/carts.types";
import { useCrudQuery } from "@/shared/crud";

export function useCartStats() {
  const queryFn = useCallback((signal?: AbortSignal) => cartsService.getStats(signal), []);
  return useCrudQuery<CartStats>({
    queryKey: ["carts", "stats"],
    queryFn,
  });
}
