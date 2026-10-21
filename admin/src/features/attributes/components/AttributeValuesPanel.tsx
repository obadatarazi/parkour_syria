import { ListTree, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { AttributeValueInlineForm } from "@/features/attributes/components/AttributeValueInlineForm";
import { getAttributeValueLabel } from "@/features/attributes/utils/attribute-display.utils";
import {
  type AttributeValueQuickToggleField,
  useAttributeValueMutations,
} from "@/features/attribute-values/hooks/use-attribute-value-mutations";
import { attributeValuesService } from "@/features/attribute-values/services/attribute-values.service";
import type { AttributeValue } from "@/features/attribute-values/types/attribute-values.types";
import { AppBadge, AppButton } from "@/shared/components";
import {
  CrudDeleteDialog,
  CrudTableBooleanToggle,
  useCrudDialog,
  useCrudQuickToggle,
  useCrudQuery,
} from "@/shared/crud";
import { Skeleton } from "@/shared/design-system/components/ui/skeleton";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { cn } from "@/shared/design-system/components/ui/utils";
import {
  formatBilingualLabel,
  getBilingualTitle,
} from "@/shared/lib/translation-display.utils";

type ActiveFormState =
  | { mode: "create" }
  | { mode: "edit"; valueId: number }
  | null;

type AttributeValuesPanelProps = {
  attributeId: number;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  onValuesChanged?: () => void | Promise<void>;
};

function ValueRowSkeleton() {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background px-4 py-3">
      <div className="flex flex-1 flex-wrap gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-6 w-11 rounded-full" />
    </div>
  );
}

export function AttributeValuesPanel({
  attributeId,
  canCreate = false,
  canUpdate = false,
  canDelete = false,
  onValuesChanged,
}: AttributeValuesPanelProps) {
  const t = useTranslation();
  const valueDialog = useCrudDialog<AttributeValue>();
  const [activeForm, setActiveForm] = useState<ActiveFormState>(null);

  const valuesQuery = useCrudQuery({
    queryKey: ["attribute-values", "by-attribute", String(attributeId)],
    queryFn: () =>
      attributeValuesService.list({
        attributeId,
        limit: 100,
        sort: "created_at",
        direction: "desc",
      }),
    enabled: attributeId > 0,
  });

  const values = valuesQuery.data?.data ?? [];

  const refresh = useCallback(async () => {
    await valuesQuery.refetch();
    await onValuesChanged?.();
  }, [onValuesChanged, valuesQuery]);

  const { deleteMutation, quickToggle, isDeleting } = useAttributeValueMutations({
    onSuccess: refresh,
  });

  const { handleToggle, isToggleLoading } = useCrudQuickToggle<AttributeValue>({
    patchItems: (updater) => {
      valuesQuery.patchData((current) => ({
        ...current,
        data: updater(current.data),
      }));
    },
    toggle: (entity, field, value) =>
      quickToggle(entity, field as AttributeValueQuickToggleField, value),
  });

  const valueLabel = useMemo(() => {
    if (!valueDialog.entity) return undefined;
    return formatBilingualLabel(
      getBilingualTitle(valueDialog.entity.translations, valueDialog.entity.title),
    );
  }, [valueDialog.entity]);

  const openCreateForm = () => {
    setActiveForm({ mode: "create" });
  };

  const openEditForm = (value: AttributeValue) => {
    setActiveForm({ mode: "edit", valueId: value.id });
  };

  const closeForm = () => {
    setActiveForm(null);
  };

  const handleFormSuccess = async () => {
    closeForm();
    await refresh();
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">{t.attributeValues}</h3>
          <AppBadge
            label={String(values.length)}
            variant="neutral"
            className="min-w-6 justify-center px-2 font-medium tabular-nums"
          />
        </div>

        {canCreate ? (
          <AppButton
            size="sm"
            variant={activeForm?.mode === "create" ? "outline" : "default"}
            onClick={() => {
              if (activeForm?.mode === "create") {
                closeForm();
                return;
              }
              openCreateForm();
            }}
          >
            <Plus className="size-4" aria-hidden="true" />
            {t.addAttributeValue}
          </AppButton>
        ) : null}
      </div>

      {activeForm?.mode === "create" ? (
        <AttributeValueInlineForm
          mode="create"
          attributeId={attributeId}
          onSuccess={handleFormSuccess}
          onCancel={closeForm}
        />
      ) : null}

      {valuesQuery.isLoading ? (
        <div className="space-y-2">
          <ValueRowSkeleton />
          <ValueRowSkeleton />
          <ValueRowSkeleton />
        </div>
      ) : valuesQuery.isError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-6 text-center">
          <p className="text-sm text-destructive">{t.errorStateDefaultTitle}</p>
          <AppButton
            size="sm"
            variant="outline"
            className="mt-3"
            onClick={() => void valuesQuery.refetch()}
          >
            {t.tryAgain}
          </AppButton>
        </div>
      ) : !values.length && activeForm?.mode !== "create" ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
            <ListTree className="size-5 text-muted-foreground" aria-hidden="true" />
          </div>
          <p className="text-sm font-medium text-foreground">{t.noData}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t.attributeValuesEmptyHint}</p>
          {canCreate ? (
            <AppButton size="sm" className="mt-4" onClick={openCreateForm}>
              <Plus className="size-4" aria-hidden="true" />
              {t.addAttributeValue}
            </AppButton>
          ) : null}
        </div>
      ) : (
        <ul className="space-y-2">
          {values.map((value) => {
            const title = getBilingualTitle(value.translations, value.title);
            const isEditing = activeForm?.mode === "edit" && activeForm.valueId === value.id;

            if (isEditing) {
              return (
                <li key={value.id}>
                  <AttributeValueInlineForm
                    mode="edit"
                    attributeId={attributeId}
                    attributeValue={value}
                    onSuccess={handleFormSuccess}
                    onCancel={closeForm}
                  />
                </li>
              );
            }

            return (
              <li
                key={value.id}
                className={cn(
                  "group flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-background px-4 py-3 transition-colors",
                  "hover:border-border hover:bg-muted/20",
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {title.en ? (
                      <AppBadge label={title.en} variant="brand" className="font-medium" />
                    ) : null}
                    {title.ar ? (
                      <span dir="rtl">
                        <AppBadge label={title.ar} variant="neutral" className="font-medium" />
                      </span>
                    ) : null}
                    {!title.en && !title.ar ? (
                      <span className="text-sm text-muted-foreground">
                        {getAttributeValueLabel(value)}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <CrudTableBooleanToggle
                    entity={value}
                    field="publish"
                    checked={value.publish ?? false}
                    canUpdate={canUpdate}
                    isLoading={isToggleLoading(value.id, "publish")}
                    ariaLabel={`${t.status}: ${getAttributeValueLabel(value)}`}
                    onToggle={(entity, field, nextValue) =>
                      void handleToggle(entity, field, nextValue)
                    }
                  />

                  {canUpdate ? (
                    <AppButton
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={t.editAction}
                      className="opacity-70 transition-opacity group-hover:opacity-100"
                      onClick={() => {
                        closeForm();
                        openEditForm(value);
                      }}
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                    </AppButton>
                  ) : null}

                  {canDelete ? (
                    <AppButton
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={t.deleteAction}
                      className="text-destructive opacity-70 transition-opacity group-hover:opacity-100"
                      onClick={() => valueDialog.openDelete(value)}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </AppButton>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <CrudDeleteDialog
        open={valueDialog.mode === "delete"}
        onOpenChange={(open) => {
          if (!open) valueDialog.close();
        }}
        entityLabel={valueLabel}
        isLoading={isDeleting}
        onConfirm={async () => {
          if (valueDialog.entity) {
            if (activeForm?.mode === "edit" && activeForm.valueId === valueDialog.entity.id) {
              closeForm();
            }
            const result = await deleteMutation.mutate(valueDialog.entity);
            if (result.ok) valueDialog.close();
          }
        }}
      />
    </section>
  );
}
