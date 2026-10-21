import { Plus, Star, Trash2, Upload } from "lucide-react";
import { type DragEvent, useRef } from "react";

import type { ProductImageFormItem } from "@/features/products/types/products.types";
import { createEmptyProductImageItem } from "@/features/products/types/products.types";
import {
  replaceProductImageSlot,
  revokeIfBlob,
} from "@/features/products/utils/product-image-slot.utils";
import { AppButton, ImageReplaceHoverOverlay, MediaImage } from "@/shared/components";
import { cn } from "@/shared/design-system/components/ui/utils";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type ProductImageGalleryFieldsProps = {
  images: ProductImageFormItem[];
  deletedImageIds: number[];
  onChange: (images: ProductImageFormItem[], deletedImageIds: number[]) => void;
  error?: string;
};

function imageSlotKey(image: ProductImageFormItem, index: number): string {
  return image.clientId ?? (image.id != null ? `id-${image.id}` : `slot-${index}`);
}

function hasVisibleImage(image: ProductImageFormItem): boolean {
  return Boolean(image.previewUrl) || image.file instanceof File;
}

export function ProductImageGalleryFields({
  images,
  deletedImageIds,
  onChange,
  error,
}: ProductImageGalleryFieldsProps) {
  const t = useTranslation();
  const fileInputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const openFilePicker = (index: number) => {
    const input = fileInputRefs.current[index];
    if (!input) return;
    input.value = "";
    input.click();
  };

  const handleFile = (index: number, file: File | null) => {
    if (!file) return;
    const next = replaceProductImageSlot(images, deletedImageIds, index, file);
    onChange(next.images, next.deletedImageIds);
  };

  const setFeatured = (index: number) => {
    onChange(
      images.map((image, entryIndex) => ({ ...image, featured: entryIndex === index })),
      deletedImageIds,
    );
  };

  const addImage = () => {
    onChange([...images, createEmptyProductImageItem(images.every((image) => !image.featured))], deletedImageIds);
  };

  const removeImage = (index: number) => {
    const target = images[index];
    revokeIfBlob(target?.previewUrl);
    const nextDeletedIds =
      target?.id && !deletedImageIds.includes(target.id)
        ? [...deletedImageIds, target.id]
        : deletedImageIds;
    const remaining = images.filter((_, entryIndex) => entryIndex !== index);
    const nextImages = remaining.length ? remaining : [createEmptyProductImageItem(true)];
    if (target?.featured && nextImages.length && !nextImages.some((image) => image.featured)) {
      nextImages[0] = { ...nextImages[0], featured: true };
    }
    onChange(nextImages, nextDeletedIds);
  };

  const handleDrop = (index: number, event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file?.type.startsWith("image/")) {
      handleFile(index, file);
    }
  };

  return (
    <div className="space-y-3">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <p className="text-xs text-muted-foreground">{t.replaceImageHint}</p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((image, index) => {
          const visible = hasVisibleImage(image);
          return (
            <div
              key={imageSlotKey(image, index)}
              className="group relative overflow-hidden rounded-xl border border-border bg-muted/20"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleDrop(index, event)}
            >
              <input
                ref={(element) => {
                  fileInputRefs.current[index] = element;
                }}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => handleFile(index, event.target.files?.[0] ?? null)}
              />

              {visible ? (
                <button
                  type="button"
                  className="group relative block w-full"
                  onClick={() => openFilePicker(index)}
                  aria-label={t.clickToChangeImage}
                >
                  <MediaImage
                    src={image.previewUrl ?? undefined}
                    alt=""
                    className="aspect-[3/4] w-full object-cover transition-transform duration-200 group-hover:scale-[1.01]"
                  />
                  <ImageReplaceHoverOverlay label={t.clickToChangeImage} />
                </button>
              ) : (
                <button
                  type="button"
                  className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-1.5 px-3 text-center text-muted-foreground transition hover:bg-muted/40 hover:text-foreground"
                  onClick={() => openFilePicker(index)}
                >
                  <Upload className="size-5" aria-hidden="true" />
                  <span className="text-xs font-medium">{t.dragDrop}</span>
                </button>
              )}

              <div className="absolute start-2 top-2 flex gap-1">
                {visible ? (
                  <button
                    type="button"
                    onClick={() => setFeatured(index)}
                    className={cn(
                      "inline-flex size-7 items-center justify-center rounded-lg border bg-background/90 shadow-sm",
                      image.featured
                        ? "border-amber-300 text-amber-600"
                        : "border-border text-muted-foreground hover:text-foreground",
                    )}
                    aria-label={t.featured}
                    title={t.featured}
                  >
                    <Star className={cn("size-3.5", image.featured && "fill-current")} />
                  </button>
                ) : null}
              </div>

              {images.length > 1 || visible ? (
                <button
                  type="button"
                  className="absolute end-2 top-2 inline-flex size-7 items-center justify-center rounded-lg border border-border bg-background/90 text-muted-foreground shadow-sm hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => removeImage(index)}
                  aria-label={t.deleteAction}
                >
                  <Trash2 className="size-3.5" />
                </button>
              ) : null}
            </div>
          );
        })}
      </div>

      <AppButton type="button" variant="outline" size="sm" onClick={addImage}>
        <Plus className="size-4" />
        {t.addImage}
      </AppButton>
    </div>
  );
}
