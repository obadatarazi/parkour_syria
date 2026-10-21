import { type ReactNode, useEffect, useState } from "react";

import type {
  DeliveryZonesPrice,
  DeliveryZonesPriceFormData,
} from "@/features/delivery-zones-prices/types/delivery-zones-prices.types";
import {
  createEmptyDeliveryZonesPriceForm,
  deliveryZonesPriceToFormData,
} from "@/features/delivery-zones-prices/types/delivery-zones-prices.types";
import { useStateOptions } from "@/features/states/hooks/use-state-options";
import { SelectField, TextField, ToggleField } from "@/shared/components";
import { CrudFormFooter, CrudFormShell } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type DeliveryZonesPriceFormProps = {
  mode: "create" | "edit";
  entity?: DeliveryZonesPrice | null;
  isLoading?: boolean;
  onSubmit: (data: DeliveryZonesPriceFormData) => void | Promise<void>;
  onCancel: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
};

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-xl border border-border bg-muted/15 p-4">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function DeliveryZonesPriceForm({
  mode,
  entity,
  isLoading = false,
  onSubmit,
  onCancel,
  onDirtyChange,
}: DeliveryZonesPriceFormProps) {
  const t = useTranslation();
  const { options: stateOptions, isLoading: isStateOptionsLoading } = useStateOptions();
  const [form, setForm] = useState<DeliveryZonesPriceFormData>(
    createEmptyDeliveryZonesPriceForm(),
  );
  const [stateError, setStateError] = useState<string | undefined>();
  const [feeError, setFeeError] = useState<string | undefined>();
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setForm(entity ? deliveryZonesPriceToFormData(entity) : createEmptyDeliveryZonesPriceForm());
    setStateError(undefined);
    setFeeError(undefined);
    setIsDirty(false);
  }, [entity, mode]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const updateForm = (updater: (current: DeliveryZonesPriceFormData) => DeliveryZonesPriceFormData) => {
    setForm(updater);
    setIsDirty(true);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextStateError = !form.stateId ? t.required : undefined;
    const fee = form.deliveryFee;
    const nextFeeError =
      fee === null || fee === undefined || Number.isNaN(fee) || fee < 0
        ? t.required
        : undefined;
    setStateError(nextStateError);
    setFeeError(nextFeeError);
    if (nextStateError || nextFeeError) return;
    void onSubmit(form);
  };

  return (
    <CrudFormShell onSubmit={handleSubmit} className="space-y-4">
      <FormSection title={t.deliveryZonesPriceDetails}>
        <SelectField
          label={t.state}
          value={form.stateId ? String(form.stateId) : ""}
          onValueChange={(value) =>
            updateForm((current) => ({
              ...current,
              stateId: value ? Number(value) : null,
            }))
          }
          options={stateOptions}
          placeholder={t.selectState}
          error={stateError}
          required
          disabled={isStateOptionsLoading || mode === "edit"}
        />

        <TextField
          label={t.deliveryFee}
          type="number"
          min={0}
          step="0.01"
          value={form.deliveryFee === null || form.deliveryFee === undefined ? "" : String(form.deliveryFee)}
          onChange={(event) => {
            const raw = event.target.value;
            updateForm((current) => ({
              ...current,
              deliveryFee: raw === "" ? null : Number(raw),
            }));
          }}
          error={feeError}
          required
          endAdornment={<span className="text-xs text-muted-foreground">{t.kwd}</span>}
        />

        <ToggleField
          label={t.publish}
          checked={form.publish ?? true}
          onCheckedChange={(checked) => updateForm((current) => ({ ...current, publish: checked }))}
        />
      </FormSection>

      <CrudFormFooter
        submitLabel={mode === "create" ? t.addDeliveryZonesPrice : t.save}
        cancelLabel={t.cancel}
        onCancel={onCancel}
        isLoading={isLoading}
        loadingLabel={t.loadingMessage}
      />
    </CrudFormShell>
  );
}
