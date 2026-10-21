import type { Area } from "@/features/areas/types/areas.types";
import { StatusBadge } from "@/shared/components";
import { CrudDetailField, CrudLocaleFieldsView, CrudViewDialog } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { pickLocaleText } from "@/shared/lib/api/locale-fields.utils";

type AreaViewDialogProps = {
  open: boolean;
  area: Area | null;
  canUpdate?: boolean;
  canDelete?: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (area: Area) => void;
  onDelete?: (area: Area) => void;
};

export function AreaViewDialog({ area, ...props }: AreaViewDialogProps) {
  const t = useTranslation();
  if (!area) return null;

  return (
    <CrudViewDialog
      {...props}
      entity={area}
      title={t.viewArea}
      cancelLabel={t.cancel}
      editLabel={t.editAction}
      deleteLabel={t.deleteAction}
      hero={
        <div className="space-y-3">
          <p className="text-lg font-semibold text-foreground">
            {pickLocaleText(area.translations, "name", area.name)}
          </p>
          <StatusBadge
            label={area.publish ? t.publishedLabel : t.draftLabel}
            variant={area.publish ? "success" : "neutral"}
          />
        </div>
      }
      sections={[
        {
          id: "content",
          title: t.sectionContent,
          content: (
            <CrudLocaleFieldsView
              translations={area.translations}
              fields={[{ key: "name", label: t.fieldName }]}
            />
          ),
        },
        {
          id: "details",
          title: t.sectionDetails,
          content: (
            <div className="grid gap-4 sm:grid-cols-2">
              <CrudDetailField label={t.slug}>
                <span dir="ltr" className="font-mono text-sm">{area.slug}</span>
              </CrudDetailField>
              <CrudDetailField label={t.sortOrder}>{area.sortOrder}</CrudDetailField>
            </div>
          ),
        },
      ]}
    />
  );
}
