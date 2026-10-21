import type { ReactNode } from "react";

import type { DirectoryEntry } from "@/features/directory-entries/types/directory-entries.types";
import { directoryEntryTypeLabel } from "@/features/directory-entries/utils/directory-entry-labels";
import { MediaImage, StatusBadge } from "@/shared/components";
import { CrudDetailField, CrudLocaleFieldsView, CrudViewDialog } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { pickLocaleText } from "@/shared/lib/api/locale-fields.utils";

type DirectoryEntryViewDialogProps = {
  open: boolean;
  entry: DirectoryEntry | null;
  canUpdate?: boolean;
  canDelete?: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (entry: DirectoryEntry) => void;
  onDelete?: (entry: DirectoryEntry) => void;
};

function LinkValue({ href, empty }: { href?: string | null; empty: ReactNode }) {
  if (!href) return <span className="text-muted-foreground">{empty}</span>;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      dir="ltr"
      className="break-all text-sm text-brand underline-offset-2 hover:underline"
    >
      {href}
    </a>
  );
}

export function DirectoryEntryViewDialog({ entry, ...props }: DirectoryEntryViewDialogProps) {
  const t = useTranslation();
  if (!entry) return null;

  return (
    <CrudViewDialog
      {...props}
      entity={entry}
      size="xl"
      title={t.viewDirectoryEntry}
      cancelLabel={t.cancel}
      editLabel={t.editAction}
      deleteLabel={t.deleteAction}
      hero={
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          {entry.imageFileUrl ? (
            <MediaImage
              src={entry.imageFileUrl}
              alt=""
              className="size-24 shrink-0 rounded-xl border border-border object-cover"
            />
          ) : null}
          <div className="min-w-0 flex-1 space-y-3">
            <p className="text-lg font-semibold text-foreground">
              {pickLocaleText(entry.translations, "name", entry.name)}
            </p>
            <div className="flex flex-wrap gap-2">
              <StatusBadge label={directoryEntryTypeLabel(t, entry.type)} variant="info" />
              <StatusBadge
                label={entry.verified ? t.verifiedYes : t.verifiedNo}
                variant={entry.verified ? "success" : "warning"}
              />
              <StatusBadge
                label={entry.publish ? t.publishedLabel : t.draftLabel}
                variant={entry.publish ? "success" : "neutral"}
              />
            </div>
          </div>
        </div>
      }
      sections={[
        {
          id: "content",
          title: t.sectionContent,
          content: (
            <CrudLocaleFieldsView
              translations={entry.translations}
              fields={[
                { key: "name", label: t.fieldName },
                { key: "description", label: t.fieldDescription, richText: true },
              ]}
            />
          ),
        },
        {
          id: "contact",
          title: t.sectionContact,
          content: (
            <div className="grid gap-4 sm:grid-cols-2">
              <CrudDetailField label={t.fieldArea}>
                {entry.area?.name || <span className="text-muted-foreground">{t.noArea}</span>}
              </CrudDetailField>
              <CrudDetailField label={t.fieldWhatsapp}>
                {entry.whatsapp ? (
                  <span dir="ltr">{entry.whatsapp}</span>
                ) : (
                  <span className="text-muted-foreground">{t.notSet}</span>
                )}
              </CrudDetailField>
              <CrudDetailField label={t.fieldFacebookUrl}>
                <LinkValue href={entry.facebookUrl} empty={t.notSet} />
              </CrudDetailField>
              <CrudDetailField label={t.fieldInstagramUrl}>
                <LinkValue href={entry.instagramUrl} empty={t.notSet} />
              </CrudDetailField>
              <CrudDetailField label={t.fieldMapUrl}>
                <LinkValue href={entry.mapUrl} empty={t.notSet} />
              </CrudDetailField>
            </div>
          ),
        },
        {
          id: "details",
          title: t.sectionDetails,
          content: (
            <div className="grid gap-4 sm:grid-cols-2">
              <CrudDetailField label={t.slug}>
                <span dir="ltr" className="font-mono text-sm">{entry.slug}</span>
              </CrudDetailField>
              <CrudDetailField label={t.sortOrder}>{entry.sortOrder}</CrudDetailField>
            </div>
          ),
        },
      ]}
    />
  );
}
