import { type ReactNode, useEffect, useState } from "react";

import type {
  LoyaltyReward,
  LoyaltyRewardFormData,
} from "@/features/loyalty-rewards/types/loyalty-rewards.types";
import {
  createEmptyLoyaltyRewardForm,
  loyaltyRewardToFormData,
} from "@/features/loyalty-rewards/types/loyalty-rewards.types";
import { SelectField, TextAreaField, TextField, ToggleField } from "@/shared/components";
import { CrudFormFooter, CrudFormShell } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { CRUD_FORM_FIELD_ANCHORS, LOYALTY_FORM_ANCHORS } from "@/shared/guidance/constants/guidance.constants";
import { useLoyaltyRewardTypeOptions } from "@/shared/hooks/use-options";

type LoyaltyRewardFormProps = {
  mode: "create" | "edit";
  reward?: LoyaltyReward | null;
  isLoading?: boolean;
  onSubmit: (data: LoyaltyRewardFormData) => void | Promise<void>;
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

export function LoyaltyRewardForm({
  mode,
  reward,
  isLoading = false,
  onSubmit,
  onCancel,
  onDirtyChange,
}: LoyaltyRewardFormProps) {
  const t = useTranslation();
  const { options: typeOptions } = useLoyaltyRewardTypeOptions();
  const [form, setForm] = useState<LoyaltyRewardFormData>(createEmptyLoyaltyRewardForm());
  const [nameErrors, setNameErrors] = useState<Partial<Record<"en" | "ar", string>>>({});
  const [rewardValueError, setRewardValueError] = useState<string | undefined>();

  const isFreeShipping = form.type === "FREE_SHIPPING";

  useEffect(() => {
    const next = reward ? loyaltyRewardToFormData(reward) : createEmptyLoyaltyRewardForm();
    setForm(next);
    setNameErrors({});
    setRewardValueError(undefined);
    onDirtyChange?.(false);
  }, [reward, mode, onDirtyChange]);

  const updateForm = (patch: Partial<LoyaltyRewardFormData>) => {
    setForm((current) => {
      const next = { ...current, ...patch };
      if (patch.type === "FREE_SHIPPING") {
        next.rewardValue = null;
      }
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

    let nextRewardValueError: string | undefined;
    if (!isFreeShipping && (form.rewardValue == null || form.rewardValue <= 0)) {
      nextRewardValueError = t.required;
    }
    setRewardValueError(nextRewardValueError);

    setNameErrors(errors);
    if (Object.keys(errors).length > 0 || nextRewardValueError) return;

    void onSubmit({
      ...form,
      rewardValue: isFreeShipping ? null : form.rewardValue,
    });
  };

  return (
    <CrudFormShell onSubmit={handleSubmit} className="space-y-4">
      <FormSection title={t.loyaltyRewards} description={t.loyaltyNotCouponHint}>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label={t.loyaltyRewardCode}
            value={form.code}
            onChange={(event) => updateForm({ code: event.target.value.toUpperCase() })}
            required
            disabled={isLoading}
          />
          <SelectField
            label={t.loyaltyRewardType}
            value={form.type}
            onValueChange={(type) => updateForm({ type })}
            options={typeOptions}
            required
            disabled={isLoading}
            helperText={t.loyaltyRewardTypeHint}
          />
          <TextField
            label={t.loyaltyRewardPointsCost}
            type="number"
            min={1}
            value={String(form.pointsCost)}
            onChange={(event) => updateForm({ pointsCost: Number(event.target.value) || 1 })}
            required
            disabled={isLoading}
          />
          {!isFreeShipping ? (
            <TextField
              label={t.loyaltyRewardValue}
              type="number"
              min={0}
              step="0.01"
              value={form.rewardValue == null ? "" : String(form.rewardValue)}
              onChange={(event) => {
                const raw = event.target.value;
                updateForm({ rewardValue: raw === "" ? null : Number(raw) });
                setRewardValueError(undefined);
              }}
              error={rewardValueError}
              required
              disabled={isLoading}
            />
          ) : null}
          <TextField
            label={t.loyaltyRewardUsageLimit}
            type="number"
            min={1}
            value={form.usageLimit == null ? "" : String(form.usageLimit)}
            onChange={(event) => {
              const raw = event.target.value;
              updateForm({ usageLimit: raw === "" ? null : Number(raw) });
            }}
            disabled={isLoading}
          />
          <TextField
            label={t.loyaltyRewardExpiresAfterDays}
            type="number"
            min={1}
            value={form.expiresAfterDays == null ? "" : String(form.expiresAfterDays)}
            onChange={(event) => {
              const raw = event.target.value;
              updateForm({ expiresAfterDays: raw === "" ? null : Number(raw) });
            }}
            disabled={isLoading}
          />
          <div data-guidance={LOYALTY_FORM_ANCHORS.rewardMinCart}>
            <TextField
              label={t.loyaltyMinimumCartTotal}
              type="number"
              min={0}
              step="0.01"
              value={form.minimumCartTotal == null ? "" : String(form.minimumCartTotal)}
              onChange={(event) => {
                const raw = event.target.value;
                updateForm({ minimumCartTotal: raw === "" ? null : Number(raw) });
              }}
              helperText={t.loyaltyMinimumCartTotalHint}
              disabled={isLoading}
            />
          </div>
        </div>
        <div data-guidance={CRUD_FORM_FIELD_ANCHORS.visibility}>
          <ToggleField
            label={t.active}
            checked={form.isActive}
            onCheckedChange={(isActive) => updateForm({ isActive })}
            description={t.loyaltyRewardActiveHint}
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
        submitLabel={mode === "create" ? t.addLoyaltyReward : t.saveChanges}
        cancelLabel={t.cancel}
        onCancel={onCancel}
        isLoading={isLoading}
        loadingLabel={t.loadingMessage}
      />
    </CrudFormShell>
  );
}
