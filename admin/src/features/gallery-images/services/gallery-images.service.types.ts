import type {
  GalleryImage,
  GalleryImageFormData,
  GalleryImageListParams,
  GalleryImageListResult,
} from "@/features/gallery-images/types/gallery-images.types";
import type { BulkDeleteApiResult } from "@/shared/lib/api";

export interface GalleryImagesService {
  list(params?: GalleryImageListParams, signal?: AbortSignal): Promise<GalleryImageListResult>;
  getById(id: number): Promise<GalleryImage>;
  create(data: GalleryImageFormData): Promise<GalleryImage>;
  update(id: number, data: Partial<GalleryImageFormData>): Promise<GalleryImage>;
  delete(id: number): Promise<void>;
  bulkDelete(ids: Array<string | number>): Promise<BulkDeleteApiResult>;
}
