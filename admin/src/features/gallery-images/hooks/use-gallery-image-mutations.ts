import { galleryImagesService } from "@/features/gallery-images/services/gallery-images.service";
import { galleryImageToFormData, pickGalleryImageFormChanges } from "@/features/gallery-images/types/gallery-images.types";
import { useEntityCrudMutations } from "@/shared/crud";

export function useGalleryImageMutations({ onSuccess }: { onSuccess?: () => void | Promise<void> } = {}) {
  return useEntityCrudMutations({
    service: galleryImagesService,
    toFormData: galleryImageToFormData,
    pickChanges: pickGalleryImageFormChanges,
    onSuccess,
  });
}
