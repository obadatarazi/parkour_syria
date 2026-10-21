import { type ReactNode, useEffect, useState } from "react";

import type {
  LoyaltyEvent,
  LoyaltyEventFormData,
} from "@/features/loyalty-events/types/loyalty-events.types";
import {
  createEmptyLoyaltyEventForm,
  loyaltyEventToFormData,
} from "@/features/loyalty-events/types/loyalty-events.types";
import { SelectField, TextAreaField, TextField, ToggleField } from "@/shared/components";
import { CrudFormFooter, CrudFormShell } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { CRUD_FORM_FIELD_ANCHORS } from "@/shared/guidance/constants/guidance.constants";
import { useLoyaltyEventTypeOptions } from "@/shared/hooks/use-options";

type LoyaltyEventFormProps = {
  mode: "create" | "edit";
  event?: LoyaltyEvent | null;
  isLoading?: boolean;
  onSubmit: (data: LoyaltyEventFormData) => void | Promise<void>;
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

export function LoyaltyEventForm({
  mode,
  event,
  isLoading = false,
  onSubmit,
  onCancel,
  onDirtyChange,
}: LoyaltyEventFormProps) {
  const t = useTranslation();
  const { options: typeOptions } = useLoyaltyEventTypeOptions();
  const [form, setForm] = useState<LoyaltyEventFormData>(createEmptyLoyaltyEventForm());
  const [nameErrors, setNameErrors] = useState<Partial<Record<"en" | "ar", string>>>({});

  useEffect(() => {
    const next = event ? loyaltyEventToFormData(event) : createEmptyLoyaltyEventForm();
    setForm(next);
    setNameErrors({});
    onDirtyChange?.(false);
  }, [event, mode, onDirtyChange]);

  const updateForm = (patch: Partial<LoyaltyEventFormData>) => {
    setForm((current) => {
      const next = { ...current, ...patch };
      onDirtyChange?.(true);
      return next;
    });
  };

  const updateTranslation = (
    locale: "en" | "ar",
    field: "name" | "description",
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      translations: {
        ...current.translations,
        [locale]: {
          name: current.translations[locale]?.name ?? "",
          description: current.translations[locale]?.description ?? "",
          [field]: value,
        },
      },
    }));
    onDirtyChange?.(true);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors: Partial<Record<"en" | "ar", string>> = {};
    if (!form.translations.en?.name?.trim()) errors.en = t.required;
    if (!form.translations.ar?.name?.trim()) errors.ar = t.required;
    if (!form.code.trim()) return;
    setNameErrors(errors);
    if (Object.keys(errors).length > 0) return;
    void onSubmit(form);
  };

  return (
    <CrudFormShell onSubmit={handleSubmit} className="space-y-4">
      <FormSection title={t.loyaltyEvents} description={t.loyaltyNotCouponHint}>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label={t.loyaltyEventCode}
            value={form.code}
            onChange={(event) => updateForm({ code: event.target.value.toUpperCase() })}
            required
            disabled={isLoading}
          />
          <SelectField
            label={t.loyaltyEventType}
            value={form.type}
            onValueChange={(type) => updateForm({ type })}
            options={typeOptions}
            required
            disabled={isLoading}
          />
          <TextField
            label={t.loyaltyEventPoints}
            type="number"
            min={0}
            value={String(form.points)}
            onChange={(event) => updateForm({ points: Number(event.target.value) || 0 })}
            required
            disabled={isLoading}
          />
          <TextField
            label={t.loyaltyEventMaxTimes}
            type="number"
            min={1}
            value={form.maxTimes == null ? "" : String(form.maxTimes)}
            onChange={(event) => {
              const raw = event.target.value;
              updateForm({ maxTimes: raw === "" ? null : Number(raw) });
            }}
            disabled={isLoading}
          />
        </div>
        <div data-guidance={CRUD_FORM_FIELD_ANCHORS.visibility}>
          <ToggleField
            label={t.active}
            checked={form.isActive}
            onCheckedChange={(isActive) => updateForm({ isActive })}
            description={t.loyaltyEventActiveHint}
            disabled={isLoading}
          />
        </div>
      </FormSection>

      <FormSection title={t.tagContent}>
        <TextField
          label={t.loyaltyNameEnglish}
          value={form.translations.en?.name ?? ""}
          onChange={(event) => updateTranslation("en", "name", event.target.value)}
          error={nameErrors.en}
          required
          disabled={isLoading}
        />
        <TextAreaField
          label={t.descriptionEnglish}
          value={form.translations.en?.description ?? ""}
          onChange={(event) => updateTranslation("en", "description", event.target.value)}
          rows={3}
          disabled={isLoading}
        />
        <TextField
          label={t.loyaltyNameArabic}
          value={form.translations.ar?.name ?? ""}
          onChange={(event) => updateTranslation("ar", "name", event.target.value)}
          error={nameErrors.ar}
          dir="rtl"
          required
          disabled={isLoading}
        />
        <TextAreaField
          label={t.descriptionArabic}
          value={form.translations.ar?.description ?? ""}
          onChange={(event) => updateTranslation("ar", "description", event.target.value)}
          rows={3}
          dir="rtl"
          disabled={isLoading}
        />
      </FormSection>

      <CrudFormFooter
        submitLabel={mode === "create" ? t.addLoyaltyEvent : t.save}
        cancelLabel={t.cancel}
        onCancel={onCancel}
        isLoading={isLoading}
        loadingLabel={t.loadingMessage}
      />
    </CrudFormShell>
  );
}
