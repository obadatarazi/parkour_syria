import { pagesService } from "@/features/pages/services/pages.service";
import { pageToFormData, pickPageFormChanges } from "@/features/pages/types/pages.types";
import { useEntityCrudMutations } from "@/shared/crud";

export function usePageMutations({ onSuccess }: { onSuccess?: () => void | Promise<void> } = {}) {
  return useEntityCrudMutations({
    service: pagesService,
    toFormData: pageToFormData,
    pickChanges: pickPageFormChanges,
    onSuccess,
  });
}
