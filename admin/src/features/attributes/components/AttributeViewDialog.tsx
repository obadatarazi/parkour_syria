import type { Attribute } from "@/features/attributes/types/attributes.types";
import { StatusBadge } from "@/shared/components";
import { CrudDetailField, CrudViewDialog, type CrudViewDialogSection } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { getBilingualTitle } from "@/shared/lib/translation-display.utils";

type AttributeViewDialogProps = {
  open: boolean;
  attribute: Attribute | null;
  canUpdate?: boolean;
  canDelete?: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (attribute: Attribute) => void;
  onDelete?: (attribute: Attribute) => void;
};

export function AttributeViewDialog({
  open,
  attribute,
  canUpdate = false,
  canDelete = false,
  onOpenChange,
  onEdit,
  onDelete,
}: AttributeViewDialogProps) {
  const t = useTranslation();

  if (!attribute) return null;

  const title = getBilingualTitle(attribute.translations, attribute.title);

  const sections: CrudViewDialogSection[] = [
    {
      id: "content",
      title: t.attributeContent,
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          <CrudDetailField label={t.titleEnglish}>
            {title.en || <span className="text-muted-foreground">{t.notSet}</span>}
          </CrudDetailField>
          <CrudDetailField label={t.titleArabic}>
            {title.ar ? (
              <span dir="rtl" className="block">
                {title.ar}
              </span>
            ) : (
              <span className="text-muted-foreground">{t.notSet}</span>
            )}
          </CrudDetailField>
        </div>
      ),
    },
    {
      id: "details",
      title: t.attributeDetails,
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          <CrudDetailField label="ID">{attribute.id}</CrudDetailField>
          <CrudDetailField label={t.attributeValuesCount}>
            {attribute.valuesCount ?? attribute.values?.length ?? 0}
          </CrudDetailField>
        </div>
      ),
    },
  ];

  return (
    <CrudViewDialog
      open={open}
      entity={attribute}
      onOpenChange={onOpenChange}
      title={t.viewAttribute}
      cancelLabel={t.cancel}
      canUpdate={canUpdate}
      canDelete={canDelete}
      editLabel={t.editAction}
      deleteLabel={t.deleteAction}
      onEdit={onEdit}
      onDelete={onDelete}
      sections={sections}
      hero={
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div
            className="flex size-20 shrink-0 items-center justify-center rounded-xl border border-dashed border-border bg-background text-3xl"
            aria-hidden="true"
          >
            ⚙️
          </div>

          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <p className="text-lg font-semibold text-foreground">{title.en || title.ar}</p>
              {title.ar && title.en ? (
                <p dir="rtl" className="mt-1 text-sm text-muted-foreground">
                  {title.ar}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
              <StatusBadge
                label={attribute.publish ? t.active : t.inactive}
                variant={attribute.publish ? "success" : "neutral"}
              />
            </div>
          </div>
        </div>
      }
    />
  );
}
