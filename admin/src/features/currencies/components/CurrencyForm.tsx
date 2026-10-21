import { type ReactNode, useEffect, useState } from "react";

import type { Currency, CurrencyFormData } from "@/features/currencies/types/currencies.types";
import {
  createEmptyCurrencyForm,
  currencyToFormData,
} from "@/features/currencies/types/currencies.types";
import { TextField, ToggleField } from "@/shared/components";
import { TitleTranslationFields } from "@/shared/components/forms/TitleTranslationFields";
import { CrudFormFooter, CrudFormShell } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type CurrencyFormProps = {
  mode: "create" | "edit";
  currency?: Currency | null;
  isLoading?: boolean;
  onSubmit: (data: CurrencyFormData) => void | Promise<void>;
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

export function CurrencyForm({
  mode,
  currency,
  isLoading = false,
  onSubmit,
  onCancel,
  onDirtyChange,
}: CurrencyFormProps) {
  const t = useTranslation();
  const [form, setForm] = useState<CurrencyFormData>(createEmptyCurrencyForm());
  const [titleErrors, setTitleErrors] = useState<Partial<Record<"en" | "ar", string>>>({});
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<"symbol" | "code", string>>>({});
  const [isDirty, setIsDirty] = useState(false);

  const isEditingDefault = mode === "edit" && Boolean(currency?.isDefault);

  useEffect(() => {
    setForm(currency ? currencyToFormData(currency) : createEmptyCurrencyForm());
    setTitleErrors({});
    setFieldErrors({});
    setIsDirty(false);
  }, [currency, mode]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const updateForm = (updater: (current: CurrencyFormData) => CurrencyFormData) => {
    setForm(updater);
    setIsDirty(true);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextTitleErrors: Partial<Record<"en" | "ar", string>> = {};
    const nextFieldErrors: Partial<Record<"symbol" | "code", string>> = {};

    if (!form.translations.en?.title?.trim() && !form.translations.ar?.title?.trim()) {
      nextTitleErrors.en = t.required;
    }
    if (!form.symbol.trim()) {
      nextFieldErrors.symbol = t.required;
    }
    if (!form.code.trim()) {
      nextFieldErrors.code = t.required;
    }

    setTitleErrors(nextTitleErrors);
    setFieldErrors(nextFieldErrors);
    if (Object.keys(nextTitleErrors).length > 0 || Object.keys(nextFieldErrors).length > 0) {
      return;
    }
    void onSubmit({
      ...form,
      symbol: form.symbol.trim(),
      code: form.code.trim().toUpperCase(),
    });
  };

  return (
    <CrudFormShell onSubmit={handleSubmit} className="space-y-4">
      <FormSection title={t.currencyContent}>
        <TitleTranslationFields
          value={form.translations}
          onChange={(translations) => updateForm((current) => ({ ...current, translations }))}
          titleErrors={titleErrors}
          layout="tabs"
          autoFocusFirstField
        />
      </FormSection>

      <FormSection title={t.currencyDetails}>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label={t.currencyCode}
            value={form.code}
            onChange={(event) =>
              updateForm((current) => ({
                ...current,
                code: event.target.value.toUpperCase(),
              }))
            }
            error={fieldErrors.code}
            required
            maxLength={255}
            autoComplete="off"
            placeholder="KWD"
          />
          <TextField
            label={t.currencySymbol}
            value={form.symbol}
            onChange={(event) =>
              updateForm((current) => ({ ...current, symbol: event.target.value }))
            }
            error={fieldErrors.symbol}
            required
            maxLength={255}
            autoComplete="off"
            placeholder="د.ك"
          />
        </div>

        <ToggleField
          label={t.publish}
          checked={form.publish ?? true}
          onCheckedChange={(checked) => updateForm((current) => ({ ...current, publish: checked }))}
        />

        <ToggleField
          label={t.defaultCurrency}
          checked={form.isDefault ?? false}
          disabled={isEditingDefault}
          description={isEditingDefault ? t.defaultCurrencyCannotUnset : undefined}
          onCheckedChange={(checked) =>
            updateForm((current) => ({ ...current, isDefault: checked }))
          }
        />
      </FormSection>

      <CrudFormFooter
        submitLabel={mode === "create" ? t.addCurrency : t.save}
        cancelLabel={t.cancel}
        onCancel={onCancel}
        isLoading={isLoading}
        loadingLabel={t.loadingMessage}
      />
    </CrudFormShell>
  );
}
