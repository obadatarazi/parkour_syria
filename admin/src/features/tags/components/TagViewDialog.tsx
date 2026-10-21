import type { Tag } from "@/features/tags/types/tags.types";
import { StatusBadge } from "@/shared/components";
import { CrudDetailField, CrudViewDialog, type CrudViewDialogSection } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { getBilingualTitle } from "@/shared/lib/translation-display.utils";

type TagViewDialogProps = {
  open: boolean;
  tag: Tag | null;
  canUpdate?: boolean;
  canDelete?: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (tag: Tag) => void;
  onDelete?: (tag: Tag) => void;
};

export function TagViewDialog({
  open,
  tag,
  canUpdate = false,
  canDelete = false,
  onOpenChange,
  onEdit,
  onDelete,
}: TagViewDialogProps) {
  const t = useTranslation();

  if (!tag) return null;

  const title = getBilingualTitle(tag.translations, tag.title);

  const sections: CrudViewDialogSection[] = [
    {
      id: "content",
      title: t.tagContent,
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
      title: t.tagDetails,
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          <CrudDetailField label="ID">{tag.id}</CrudDetailField>
          <CrudDetailField label={t.slug}>
            {tag.slug ? (
              <span className="font-mono text-sm">{tag.slug}</span>
            ) : (
              <span className="text-muted-foreground">{t.notSet}</span>
            )}
          </CrudDetailField>
        </div>
      ),
    },
  ];

  return (
    <CrudViewDialog
      open={open}
      entity={tag}
      onOpenChange={onOpenChange}
      title={t.viewTag}
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
            🏷️
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
                label={tag.publish ? t.active : t.inactive}
                variant={tag.publish ? "success" : "neutral"}
              />
            </div>
          </div>
        </div>
      }
    />
  );
}
