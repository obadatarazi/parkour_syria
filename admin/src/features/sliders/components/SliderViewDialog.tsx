import { sitePathLabel, type Slider } from "@/features/sliders/types/sliders.types";
import { MediaImage, StatusBadge } from "@/shared/components";
import { CrudDetailField, CrudLocaleFieldsView, CrudViewDialog } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { pickLocaleText } from "@/shared/lib/api/locale-fields.utils";

type SliderViewDialogProps = {
  open: boolean;
  slider: Slider | null;
  canUpdate?: boolean;
  canDelete?: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (slider: Slider) => void;
  onDelete?: (slider: Slider) => void;
};

export function SliderViewDialog({ slider, ...props }: SliderViewDialogProps) {
  const t = useTranslation();
  if (!slider) return null;

  return (
    <CrudViewDialog
      {...props}
      entity={slider}
      size="xl"
      title={t.viewSlide}
      cancelLabel={t.cancel}
      editLabel={t.editAction}
      deleteLabel={t.deleteAction}
      hero={
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          {slider.imageFileUrl ? (
            <MediaImage
              src={slider.imageFileUrl}
              alt=""
              className="h-24 w-36 shrink-0 rounded-xl border border-border object-cover"
            />
          ) : null}
          <div className="min-w-0 flex-1 space-y-3">
            <p className="text-lg font-semibold text-foreground">
              {pickLocaleText(slider.translations, "title", slider.title)}
            </p>
            <StatusBadge
              label={slider.publish ? t.publishedLabel : t.draftLabel}
              variant={slider.publish ? "success" : "neutral"}
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
              translations={slider.translations}
              fields={[
                { key: "badge", label: t.fieldBadge },
                { key: "title", label: t.fieldTitle },
                { key: "description", label: t.fieldDescription, multiline: true },
                { key: "primary_button_text", label: t.fieldPrimaryButtonText },
                { key: "secondary_button_text", label: t.fieldSecondaryButtonText },
              ]}
            />
          ),
        },
        {
          id: "details",
          title: t.sectionDetails,
          content: (
            <div className="grid gap-4 sm:grid-cols-2">
              <CrudDetailField label={t.fieldPrimaryPage}>
                {slider.primaryPage ? sitePathLabel(t, slider.primaryPage) : t.noLinkedPage}
              </CrudDetailField>
              <CrudDetailField label={t.fieldSecondaryPage}>
                {slider.secondaryPage ? sitePathLabel(t, slider.secondaryPage) : t.noLinkedPage}
              </CrudDetailField>
              <CrudDetailField label={t.sortOrder}>{slider.sortOrder}</CrudDetailField>
            </div>
          ),
        },
      ]}
    />
  );
}
