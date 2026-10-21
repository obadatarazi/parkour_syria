import type { GalleryImagesService } from "@/features/gallery-images/services/gallery-images.service.types";
import { createApiGalleryImagesService } from "@/features/gallery-images/services/gallery-images-api.service";

export const galleryImagesService: GalleryImagesService = createApiGalleryImagesService();
