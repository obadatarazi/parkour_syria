import { slidersService } from "@/features/sliders/services/sliders.service";
import { pickSliderFormChanges,sliderToFormData } from "@/features/sliders/types/sliders.types";
import { useEntityCrudMutations } from "@/shared/crud";

export function useSliderMutations({ onSuccess }: { onSuccess?: () => void | Promise<void> } = {}) {
  return useEntityCrudMutations({
    service: slidersService,
    toFormData: sliderToFormData,
    pickChanges: pickSliderFormChanges,
    onSuccess,
  });
}
