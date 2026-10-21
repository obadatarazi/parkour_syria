import type { LoyaltyEvent } from "@/features/loyalty-events/types/loyalty-events.types";
import { StatusBadge } from "@/shared/components";
import { CrudDetailField, CrudViewDialog, type CrudViewDialogSection } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { getLoyaltyDisplayName } from "@/shared/lib/loyalty/loyalty-translations.utils";

type LoyaltyEventViewDialogProps = {
  open: boolean;
  event: LoyaltyEvent | null;
  canUpdate?: boolean;
  canDelete?: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (event: LoyaltyEvent) => void;
  onDelete?: (event: LoyaltyEvent) => void;
};

export function LoyaltyEventViewDialog({
  open,
  event,
  canUpdate = false,
  canDelete = false,
  onOpenChange,
  onEdit,
  onDelete,
}: LoyaltyEventViewDialogProps) {
  const t = useTranslation();

  if (!event) return null;

  const names = getLoyaltyDisplayName(event.translations, event.name);

  const sections: CrudViewDialogSection[] = [
    {
      id: "content",
      title: t.tagContent,
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          <CrudDetailField label={t.loyaltyNameEnglish}>
            {names.en || <span className="text-muted-foreground">{t.notSet}</span>}
          </CrudDetailField>
          <CrudDetailField label={t.loyaltyNameArabic}>
            {names.ar ? (
              <span dir="rtl" className="block">
                {names.ar}
              </span>
            ) : (
              <span className="text-muted-foreground">{t.notSet}</span>
            )}
          </CrudDetailField>
          <div className="sm:col-span-2">
            <CrudDetailField label={t.descriptionEnglish}>
              {event.translations?.en?.description?.trim() || (
                <span className="text-muted-foreground">{t.notSet}</span>
              )}
            </CrudDetailField>
          </div>
          <div className="sm:col-span-2">
            <CrudDetailField label={t.descriptionArabic}>
              {event.translations?.ar?.description?.trim() ? (
                <span dir="rtl" className="block">
                  {event.translations.ar.description}
                </span>
              ) : (
                <span className="text-muted-foreground">{t.notSet}</span>
              )}
            </CrudDetailField>
          </div>
        </div>
      ),
    },
    {
      id: "details",
      title: t.loyaltyEvents,
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          <CrudDetailField label="ID">{event.id}</CrudDetailField>
          <CrudDetailField label={t.loyaltyEventCode}>
            <span className="font-mono text-sm">{event.code}</span>
          </CrudDetailField>
          <CrudDetailField label={t.loyaltyEventType}>
            {event.type?.label || event.type?.value || t.notSet}
          </CrudDetailField>
          <CrudDetailField label={t.loyaltyEventPoints}>{event.points}</CrudDetailField>
          <CrudDetailField label={t.loyaltyEventMaxTimes}>
            {event.maxTimes ?? <span className="text-muted-foreground">{t.notSet}</span>}
          </CrudDetailField>
        </div>
      ),
    },
  ];

  return (
    <CrudViewDialog
      open={open}
      entity={event}
      onOpenChange={onOpenChange}
      title={t.viewLoyaltyEvent}
      cancelLabel={t.cancel}
      canUpdate={canUpdate}
      canDelete={canDelete}
      editLabel={t.editAction}
      deleteLabel={t.deleteAction}
      onEdit={onEdit}
      onDelete={onDelete}
      sections={sections}
      hero={
        <div className="space-y-3">
          <div>
            <p className="text-lg font-semibold text-foreground">{names.en || names.ar}</p>
            {names.ar && names.en ? (
              <p dir="rtl" className="mt-1 text-sm text-muted-foreground">
                {names.ar}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge
              label={event.isActive ? t.active : t.inactive}
              variant={event.isActive ? "success" : "neutral"}
            />
            <StatusBadge
              label={event.type?.label || event.type?.value || t.notSet}
              variant="info"
            />
          </div>
        </div>
      }
    />
  );
}
