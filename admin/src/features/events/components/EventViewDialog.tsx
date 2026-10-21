import { isPastEvent, type ParkourEvent } from "@/features/events/types/events.types";
import { eventTypeLabel, formatEventDateTime } from "@/features/events/utils/event-labels";
import { MediaImage, StatusBadge } from "@/shared/components";
import { CrudDetailField, CrudLocaleFieldsView, CrudViewDialog } from "@/shared/crud";
import {
  useLocalization,
  useTranslation,
} from "@/shared/design-system/localization/contexts/LocalizationContext";
import { pickLocaleText } from "@/shared/lib/api/locale-fields.utils";

type EventViewDialogProps = {
  open: boolean;
  event: ParkourEvent | null;
  canUpdate?: boolean;
  canDelete?: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (event: ParkourEvent) => void;
  onDelete?: (event: ParkourEvent) => void;
};

export function EventViewDialog({ event, ...props }: EventViewDialogProps) {
  const t = useTranslation();
  const { language } = useLocalization();
  if (!event) return null;

  const past = isPastEvent(event);

  return (
    <CrudViewDialog
      {...props}
      entity={event}
      size="xl"
      title={t.viewEvent}
      cancelLabel={t.cancel}
      editLabel={t.editAction}
      deleteLabel={t.deleteAction}
      hero={
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          {event.imageFileUrl ? (
            <MediaImage
              src={event.imageFileUrl}
              alt=""
              className="h-24 w-36 shrink-0 rounded-xl border border-border object-cover"
            />
          ) : null}
          <div className="min-w-0 flex-1 space-y-3">
            <p className="text-lg font-semibold text-foreground">
              {pickLocaleText(event.translations, "title", event.title)}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatEventDateTime(event.startsAt, language)}
            </p>
            <div className="flex flex-wrap gap-2">
              <StatusBadge label={eventTypeLabel(t, event.type)} variant="info" />
              <StatusBadge
                label={past ? t.eventPast : t.eventUpcoming}
                variant={past ? "neutral" : "success"}
              />
              <StatusBadge
                label={event.publish ? t.publishedLabel : t.draftLabel}
                variant={event.publish ? "success" : "neutral"}
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
              translations={event.translations}
              fields={[
                { key: "title", label: t.fieldTitle },
                { key: "location_label", label: t.fieldLocationLabel },
                { key: "description", label: t.fieldDescription, multiline: true },
              ]}
            />
          ),
        },
        {
          id: "details",
          title: t.sectionDetails,
          content: (
            <div className="grid gap-4 sm:grid-cols-2">
              <CrudDetailField label={t.fieldArea}>
                {event.area?.name || <span className="text-muted-foreground">{t.noArea}</span>}
              </CrudDetailField>
              <CrudDetailField label={t.fieldContact}>
                {event.contact || <span className="text-muted-foreground">{t.notSet}</span>}
              </CrudDetailField>
              <CrudDetailField label={t.slug}>
                <span dir="ltr" className="font-mono text-sm">{event.slug}</span>
              </CrudDetailField>
            </div>
          ),
        },
      ]}
    />
  );
}
