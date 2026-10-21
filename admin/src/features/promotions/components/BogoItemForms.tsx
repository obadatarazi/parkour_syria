import { useEffect, useState, type KeyboardEvent } from "react";

import { PromotionItemTargetPicker } from "@/features/promotions/components/PromotionItemTargetPicker";
import type {
  BogoCondition,
  BogoConditionFormData,
  BogoReward,
  BogoRewardFormData,
} from "@/features/promotions/types/promotions.types";
import {
  conditionToFormData,
  createEmptyBogoConditionForm,
  createEmptyBogoRewardForm,
  rewardToFormData,
} from "@/features/promotions/types/promotions.types";
import { AppButton, TextField } from "@/shared/components";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

/** Nested forms inside the promotion workspace are invalid HTML and reload the page. */
export function handleNestedFormEnter(
  event: KeyboardEvent<HTMLElement>,
  submit: () => void,
  disabled = false,
) {
  if (disabled || event.key !== "Enter") return;
  const target = event.target;
  if (target instanceof HTMLTextAreaElement || target instanceof HTMLButtonElement) return;
  event.preventDefault();
  event.stopPropagation();
  submit();
}

type ConditionFormProps = {
  bogoPromotionId: number;
  entity?: BogoCondition | null;
  isLoading?: boolean;
  onCancel: () => void;
  onSubmit: (data: BogoConditionFormData) => void | Promise<void>;
};

export function BogoConditionForm({
  bogoPromotionId,
  entity,
  isLoading,
  onCancel,
  onSubmit,
}: ConditionFormProps) {
  const t = useTranslation();
  const [form, setForm] = useState<BogoConditionFormData>(
    entity ? conditionToFormData(entity) : createEmptyBogoConditionForm(bogoPromotionId),
  );
  const [targetError, setTargetError] = useState<string>();

  useEffect(() => {
    setForm(entity ? conditionToFormData(entity) : createEmptyBogoConditionForm(bogoPromotionId));
    setTargetError(undefined);
  }, [bogoPromotionId, entity]);

  const canSubmit =
    form.quantity >= 1 && (form.productId != null || form.productVariantId != null);

  const submit = () => {
    if (!(form.productId != null || form.productVariantId != null)) {
      setTargetError(t.promotionItemRequired);
      return;
    }
    void onSubmit(form);
  };

  return (
    <div
      className="space-y-4 rounded-xl border border-border/70 bg-muted/20 p-4"
      onKeyDown={(event) => handleNestedFormEnter(event, submit, isLoading)}
    >
      <PromotionItemTargetPicker
        value={{ productId: form.productId, productVariantId: form.productVariantId }}
        seedItem={entity?.item}
        error={targetError}
        onChange={(next) => {
          setTargetError(undefined);
          setForm((current) => ({
            ...current,
            productId: next.productId,
            productVariantId: next.productVariantId,
          }));
        }}
      />
      <TextField
        label={t.quantity}
        type="number"
        min={1}
        value={String(form.quantity)}
        onChange={(event) => {
          const raw = event.target.value;
          setForm((current) => ({
            ...current,
            quantity: raw === "" ? 1 : Math.max(1, Number(raw) || 1),
          }));
        }}
        helperText={t.bogoConditionQuantityHint}
        required
      />
      <div className="flex flex-wrap gap-2">
        <AppButton type="button" disabled={!canSubmit || isLoading} onClick={submit}>
          {entity ? t.saveChanges : t.addBogoCondition}
        </AppButton>
        <AppButton type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          {t.cancel}
        </AppButton>
      </div>
    </div>
  );
}

type RewardFormProps = {
  bogoPromotionId: number;
  entity?: BogoReward | null;
  isLoading?: boolean;
  onCancel: () => void;
  onSubmit: (data: BogoRewardFormData) => void | Promise<void>;
};

export function BogoRewardForm({
  bogoPromotionId,
  entity,
  isLoading,
  onCancel,
  onSubmit,
}: RewardFormProps) {
  const t = useTranslation();
  const [form, setForm] = useState<BogoRewardFormData>(
    entity ? rewardToFormData(entity) : createEmptyBogoRewardForm(bogoPromotionId),
  );
  const [targetError, setTargetError] = useState<string>();

  useEffect(() => {
    setForm(entity ? rewardToFormData(entity) : createEmptyBogoRewardForm(bogoPromotionId));
    setTargetError(undefined);
  }, [bogoPromotionId, entity]);

  const canSubmit =
    form.quantity >= 1 &&
    form.discountValue >= 0 &&
    form.discountValue <= 100 &&
    (form.productId != null || form.productVariantId != null);

  const submit = () => {
    if (!(form.productId != null || form.productVariantId != null)) {
      setTargetError(t.promotionItemRequired);
      return;
    }
    void onSubmit(form);
  };

  return (
    <div
      className="space-y-4 rounded-xl border border-border/70 bg-muted/20 p-4"
      onKeyDown={(event) => handleNestedFormEnter(event, submit, isLoading)}
    >
      <PromotionItemTargetPicker
        value={{ productId: form.productId, productVariantId: form.productVariantId }}
        seedItem={entity?.item}
        error={targetError}
        onChange={(next) => {
          setTargetError(undefined);
          setForm((current) => ({
            ...current,
            productId: next.productId,
            productVariantId: next.productVariantId,
          }));
        }}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label={t.quantity}
          type="number"
          min={1}
          value={String(form.quantity)}
          onChange={(event) => {
            const raw = event.target.value;
            setForm((current) => ({
              ...current,
              quantity: raw === "" ? 1 : Math.max(1, Number(raw) || 1),
            }));
          }}
          helperText={t.bogoRewardQuantityHint}
          required
        />
        <TextField
          label={t.bogoDiscountValue}
          type="number"
          min={0}
          max={100}
          value={String(form.discountValue)}
          onChange={(event) => {
            const raw = event.target.value;
            setForm((current) => ({
              ...current,
              discountValue: raw === "" ? 0 : Math.min(100, Math.max(0, Number(raw) || 0)),
            }));
          }}
          helperText={t.bogoDiscountValueHint}
          required
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <AppButton type="button" disabled={!canSubmit || isLoading} onClick={submit}>
          {entity ? t.saveChanges : t.addBogoReward}
        </AppButton>
        <AppButton type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          {t.cancel}
        </AppButton>
      </div>
    </div>
  );
}
