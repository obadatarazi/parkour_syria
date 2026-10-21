import type { DeliveryZonesPrice } from "@/features/delivery-zones-prices/types/delivery-zones-prices.types";
import { formatKwd } from "@/features/products/utils/product-display.utils";
import { BilingualText, StatusBadge } from "@/shared/components";
import { CrudDetailField, CrudViewDialog, type CrudViewDialogSection } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { getBilingualTitle } from "@/shared/lib/translation-display.utils";

type DeliveryZonesPriceViewDialogProps = {
  open: boolean;
  entity: DeliveryZonesPrice | null;
  canUpdate?: boolean;
  canDelete?: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (entity: DeliveryZonesPrice) => void;
  onDelete?: (entity: DeliveryZonesPrice) => void;
};

export function DeliveryZonesPriceViewDialog({
  open,
  entity,
  canUpdate = false,
  canDelete = false,
  onOpenChange,
  onEdit,
  onDelete,
}: DeliveryZonesPriceViewDialogProps) {
  const t = useTranslation();

  if (!entity) return null;

  const stateTitle = entity.state
    ? getBilingualTitle(entity.state.translations, entity.state.title)
    : { en: "", ar: "" };
  const primaryLabel = stateTitle.en || stateTitle.ar || `#${entity.id}`;

  const sections: CrudViewDialogSection[] = [
    {
      id: "details",
      title: t.deliveryZonesPriceDetails,
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          <CrudDetailField label={t.state}>
            {entity.state ? (
              <BilingualText
                values={getBilingualTitle(entity.state.translations, entity.state.title)}
              />
            ) : (
              "—"
            )}
          </CrudDetailField>
          <CrudDetailField label={t.deliveryFee}>
            {formatKwd(entity.deliveryFee)}
          </CrudDetailField>
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
      title={t.viewDeliveryZonesPrice}
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
            🚚
          </div>

          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <p className="text-lg font-semibold text-foreground">{primaryLabel}</p>
              {stateTitle.ar && stateTitle.en ? (
                <p dir="rtl" className="mt-1 text-sm text-muted-foreground">
                  {stateTitle.ar}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
              <StatusBadge
                label={entity.publish ? t.active : t.inactive}
                variant={entity.publish ? "success" : "neutral"}
              />
              <StatusBadge
                label={formatKwd(entity.deliveryFee)}
                variant="neutral"
              />
            </div>
          </div>
        </div>
      }
    />
  );
}
