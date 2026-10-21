import type { ProductImageFormItem } from "@/features/products/types/products.types";
import { createEmptyProductImageItem } from "@/features/products/types/products.types";

export function revokeIfBlob(url?: string | null) {
  if (url?.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

export function replaceProductImageSlot(
  images: ProductImageFormItem[],
  deletedImageIds: number[],
  index: number,
  file: File,
): { images: ProductImageFormItem[]; deletedImageIds: number[] } {
  if (images.length === 0) {
    return {
      images: [
        {
          ...createEmptyProductImageItem(true),
          file,
          previewUrl: URL.createObjectURL(file),
        },
      ],
      deletedImageIds,
    };
  }

  const targetIndex = images[index] ? index : 0;
  const target = images[targetIndex];
  revokeIfBlob(target.previewUrl);

  const nextDeletedIds =
    target.id && !deletedImageIds.includes(target.id)
      ? [...deletedImageIds, target.id]
      : deletedImageIds;

  return {
    images: images.map((image, entryIndex) =>
      entryIndex === targetIndex
        ? {
            clientId: image.clientId ?? crypto.randomUUID(),
            file,
            previewUrl: URL.createObjectURL(file),
            featured: image.featured || images.length === 1,
          }
        : image,
    ),
    deletedImageIds: nextDeletedIds,
  };
}
