import { useCallback } from "react";

import { carePlansService } from "@/features/care-plans/services/care-plans.service";
import type { CarePlanWidgetsSnapshot } from "@/features/care-plans/types/care-plans.types";
import { useCrudQuery } from "@/shared/crud";

export const CARE_PLAN_WIDGETS_QUERY_KEY = ["care-plans", "widgets"] as const;

export function useCarePlanWidgets() {
  const queryFn = useCallback(
    (signal?: AbortSignal) => carePlansService.getWidgets(signal),
    [],
  );

  return useCrudQuery<CarePlanWidgetsSnapshot>({
    queryKey: [...CARE_PLAN_WIDGETS_QUERY_KEY],
    queryFn,
  });
}
