import { GalleryImageForm } from "@/features/gallery-images/components/GalleryImageForm";
import { useGalleryImageMutations } from "@/features/gallery-images/hooks/use-gallery-image-mutations";
import type { GalleryImage } from "@/features/gallery-images/types/gallery-images.types";
import { CrudDirtyFormDrawer } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type GalleryImageFormDrawerProps = {
  open: boolean;
  mode: "create" | "edit";
  galleryImage?: GalleryImage | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void | Promise<void>;
};

export function GalleryImageFormDrawer({
  open,
  mode,
  galleryImage,
  onOpenChange,
  onSuccess,
}: GalleryImageFormDrawerProps) {
  const t = useTranslation();
  const { save, isSaving } = useGalleryImageMutations({ onSuccess });

  return (
    <CrudDirtyFormDrawer
      open={open}
      mode={mode}
      title={mode === "create" ? t.addGalleryImage : t.editGalleryImage}
      size="xl"
      isLoading={isSaving}
      onOpenChange={onOpenChange}
    >
      {({ onDirtyChange, requestClose, closeClean }) => (
        <GalleryImageForm
          mode={mode}
          galleryImage={galleryImage}
          isLoading={isSaving}
          onCancel={requestClose}
          onDirtyChange={onDirtyChange}
          onSubmit={async (data) => {
            const result = await save(mode, data, galleryImage ?? undefined);
            if (result) closeClean();
          }}
        />
      )}
    </CrudDirtyFormDrawer>
  );
}
