import { areasService } from "@/features/areas/services/areas.service";
import { areaToFormData, pickAreaFormChanges } from "@/features/areas/types/areas.types";
import { useEntityCrudMutations } from "@/shared/crud";

export function useAreaMutations({ onSuccess }: { onSuccess?: () => void | Promise<void> } = {}) {
  return useEntityCrudMutations({
    service: areasService,
    toFormData: areaToFormData,
    pickChanges: pickAreaFormChanges,
    onSuccess,
  });
}
