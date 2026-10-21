import { Pencil, Trash2 } from "lucide-react";

import { AttributeValuesPanel } from "@/features/attributes/components/AttributeValuesPanel";
import type { Attribute } from "@/features/attributes/types/attributes.types";
import { useCrudPermissions } from "@/features/auth";
import { AppButton, StatusBadge } from "@/shared/components";
import { PERMISSIONS } from "@/shared/constants/permissions";
import { CrudEntityDrawer } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { getBilingualTitle } from "@/shared/lib/translation-display.utils";

type AttributeManageDrawerProps = {
  open: boolean;
  attribute: Attribute | null;
  canUpdate?: boolean;
  canDelete?: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (attribute: Attribute) => void;
  onDelete?: (attribute: Attribute) => void;
  onValuesChanged?: () => void | Promise<void>;
};

export function AttributeManageDrawer({
  open,
  attribute,
  canUpdate = false,
  canDelete = false,
  onOpenChange,
  onEdit,
  onDelete,
  onValuesChanged,
}: AttributeManageDrawerProps) {
  const t = useTranslation();
  const {
    canCreate: canCreateValue,
    canUpdate: canUpdateValue,
    canDelete: canDeleteValue,
  } = useCrudPermissions(PERMISSIONS.MANAGE_ATTRIBUTE_VALUE);

  if (!attribute) return null;

  const title = getBilingualTitle(attribute.translations, attribute.title);
  const attributeLabel = title.en || title.ar || attribute.title;

  return (
    <CrudEntityDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={attributeLabel}
      description={t.manageAttribute}
      size="xl"
    >
      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-muted/15 p-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    {t.titleEnglish}
                  </p>
                  <p className="text-base font-semibold text-foreground">
                    {title.en || <span className="text-muted-foreground">{t.notSet}</span>}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    {t.titleArabic}
                  </p>
                  <p dir="rtl" className="text-base font-semibold text-foreground">
                    {title.ar || <span className="text-muted-foreground">{t.notSet}</span>}
                  </p>
                </div>
              </div>

              <StatusBadge
                label={attribute.publish ? t.active : t.inactive}
                variant={attribute.publish ? "success" : "neutral"}
              />
            </div>

            {canUpdate || canDelete ? (
              <div className="flex shrink-0 flex-wrap gap-2">
                {canUpdate && onEdit ? (
                  <AppButton size="sm" variant="outline" onClick={() => onEdit(attribute)}>
                    <Pencil className="size-4" aria-hidden="true" />
                    {t.editAttribute}
                  </AppButton>
                ) : null}
                {canDelete && onDelete ? (
                  <AppButton size="sm" variant="outline" onClick={() => onDelete(attribute)}>
                    <Trash2 className="size-4 text-destructive" aria-hidden="true" />
                    {t.deleteAction}
                  </AppButton>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <AttributeValuesPanel
          attributeId={attribute.id}
          canCreate={canCreateValue}
          canUpdate={canUpdateValue}
          canDelete={canDeleteValue}
          onValuesChanged={onValuesChanged}
        />
      </div>
    </CrudEntityDrawer>
  );
}
