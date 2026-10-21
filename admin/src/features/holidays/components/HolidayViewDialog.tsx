import type { Holiday } from "@/features/holidays/types/holidays.types";
import { StatusBadge } from "@/shared/components";
import { CrudDetailField, CrudViewDialog, type CrudViewDialogSection } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type HolidayViewDialogProps = {
  open: boolean;
  entity: Holiday | null;
  canUpdate?: boolean;
  canDelete?: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (entity: Holiday) => void;
  onDelete?: (entity: Holiday) => void;
};

export function HolidayViewDialog({
  open,
  entity,
  canUpdate = false,
  canDelete = false,
  onOpenChange,
  onEdit,
  onDelete,
}: HolidayViewDialogProps) {
  const t = useTranslation();

  if (!entity) return null;

  const primaryLabel = entity.name || `#${entity.id}`;
  const formattedDate = new Date(entity.date).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const sections: CrudViewDialogSection[] = [
    {
      id: "details",
      title: t.holidayDetails,
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          <CrudDetailField label={t.holidayName}>{entity.name}</CrudDetailField>
          <CrudDetailField label={t.holidayDate}>{formattedDate}</CrudDetailField>
          {entity.description ? (
            <div className="sm:col-span-2">
              <CrudDetailField label={t.description}>{entity.description}</CrudDetailField>
            </div>
          ) : null}
          <CrudDetailField label="ID">{entity.id}</CrudDetailField>
        </div>
      ),
    },
  ];

  return (
    <CrudViewDialog
      open={open}
      entity={entity}
      onOpenChange={onOpenChange}
      title={t.viewHoliday}
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
            📅
          </div>

          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <p className="text-lg font-semibold text-foreground">{primaryLabel}</p>
              <p className="mt-1 text-sm text-muted-foreground">{formattedDate}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <StatusBadge
                label={entity.isActive ? t.active : t.inactive}
                variant={entity.isActive ? "success" : "neutral"}
              />
            </div>
          </div>
        </div>
      }
    />
  );
}
