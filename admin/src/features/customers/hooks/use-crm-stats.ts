import { useCallback } from "react";

import { customersService } from "@/features/customers/services/customers.service";
import type { CrmReport, CrmStats } from "@/features/customers/types/customers.types";
import { useCrudQuery } from "@/shared/crud";

export function useCrmStats() {
  const queryFn = useCallback(() => customersService.getStats(), []);
  return useCrudQuery<CrmStats>({
    queryKey: ["crm-stats"],
    queryFn,
  });
}

export function useCrmReport() {
  const queryFn = useCallback(() => customersService.getReport(), []);
  return useCrudQuery<CrmReport>({
    queryKey: ["crm-report"],
    queryFn,
  });
}
