import {
  createEmptyLocaleFields,
  localeFieldsFromApi,
  type LocaleFieldValues,
  pickChangedLocaleFields,
} from "@/shared/lib/api/locale-fields.utils";
import { hasFormChanges, pickChangedScalar } from "@/shared/lib/form/pick-changed-fields";
import type { PaginatedResult } from "@/shared/types";

export const GALLERY_IMAGE_LOCALE_FIELDS = ["caption"] as const;
export type GalleryImageLocaleField = (typeof GALLERY_IMAGE_LOCALE_FIELDS)[number];

export type GalleryImage = {
  id: number;
  sortOrder: number;
  publish: boolean;
  caption?: string | null;
  imageFileUrl?: string | null;
  translations?: LocaleFieldValues<GalleryImageLocaleField>;
  createdAt?: string;
  updatedAt?: string;
};

export type GalleryImageListParams = {
  page?: number;
  limit?: number;
  search?: string;
  publish?: boolean;
  sort?: string;
  direction?: "asc" | "desc";
};

export type GalleryImageFormData = {
  translations: LocaleFieldValues<GalleryImageLocaleField>;
  sortOrder: string;
  publish: boolean;
  image: File | null;
};

export type GalleryImageListResult = PaginatedResult<GalleryImage>;

export function createEmptyGalleryImageForm(): GalleryImageFormData {
  return {
    translations: createEmptyLocaleFields(GALLERY_IMAGE_LOCALE_FIELDS),
    sortOrder: "0",
    publish: true,
    image: null,
  };
}

export function galleryImageToFormData(galleryImage: GalleryImage): GalleryImageFormData {
  return {
    translations: localeFieldsFromApi(galleryImage.translations, GALLERY_IMAGE_LOCALE_FIELDS),
    sortOrder: String(galleryImage.sortOrder ?? 0),
    publish: galleryImage.publish,
    image: null,
  };
}

export function pickGalleryImageFormChanges(
  original: GalleryImageFormData,
  current: GalleryImageFormData,
): Partial<GalleryImageFormData> {
  const changes: Partial<GalleryImageFormData> = pickChangedScalar(original, current, [
    "sortOrder",
    "publish",
  ]);
  const translations = pickChangedLocaleFields(
    original.translations,
    current.translations,
    GALLERY_IMAGE_LOCALE_FIELDS,
  );
  if (translations) changes.translations = translations;
  if (current.image instanceof File) changes.image = current.image;
  return changes;
}

export function hasGalleryImageFormChanges(
  original: GalleryImageFormData,
  current: GalleryImageFormData,
): boolean {
  return hasFormChanges(pickGalleryImageFormChanges(original, current));
}
