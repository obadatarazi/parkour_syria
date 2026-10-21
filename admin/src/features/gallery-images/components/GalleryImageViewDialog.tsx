import type { GalleryImage } from "@/features/gallery-images/types/gallery-images.types";
import { MediaImage, StatusBadge } from "@/shared/components";
import { CrudDetailField, CrudLocaleFieldsView, CrudViewDialog } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { pickLocaleText } from "@/shared/lib/api/locale-fields.utils";

type GalleryImageViewDialogProps = {
  open: boolean;
  galleryImage: GalleryImage | null;
  canUpdate?: boolean;
  canDelete?: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (galleryImage: GalleryImage) => void;
  onDelete?: (galleryImage: GalleryImage) => void;
};

export function GalleryImageViewDialog({ galleryImage, ...props }: GalleryImageViewDialogProps) {
  const t = useTranslation();
  if (!galleryImage) return null;

  return (
    <CrudViewDialog
      {...props}
      entity={galleryImage}
      size="xl"
      title={t.viewGalleryImage}
      cancelLabel={t.cancel}
      editLabel={t.editAction}
      deleteLabel={t.deleteAction}
      hero={
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          {galleryImage.imageFileUrl ? (
            <MediaImage
              src={galleryImage.imageFileUrl}
              alt=""
              className="h-24 w-36 shrink-0 rounded-xl border border-border object-cover"
            />
          ) : null}
          <div className="min-w-0 flex-1 space-y-3">
            <p className="text-lg font-semibold text-foreground">
              {pickLocaleText(galleryImage.translations, "caption", galleryImage.caption)}
            </p>
            <StatusBadge
              label={galleryImage.publish ? t.publishedLabel : t.draftLabel}
              variant={galleryImage.publish ? "success" : "neutral"}
            />
          </div>
        </div>
      }
      sections={[
        {
          id: "content",
          title: t.sectionContent,
          content: (
            <CrudLocaleFieldsView
              translations={galleryImage.translations}
              fields={[{ key: "caption", label: t.fieldCaption }]}
            />
          ),
        },
        {
          id: "details",
          title: t.sectionDetails,
          content: (
            <CrudDetailField label={t.sortOrder}>{galleryImage.sortOrder}</CrudDetailField>
          ),
        },
      ]}
    />
  );
}
