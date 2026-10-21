import { type ReactNode, useEffect, useState } from "react";

import type { Country, CountryFormData } from "@/features/countries/types/countries.types";
import {
  countryToFormData,
  createEmptyCountryForm,
} from "@/features/countries/types/countries.types";
import { TextField, ToggleField } from "@/shared/components";
import { TitleTranslationFields } from "@/shared/components/forms/TitleTranslationFields";
import { CrudFormFooter, CrudFormShell } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type CountryFormProps = {
  mode: "create" | "edit";
  country?: Country | null;
  isLoading?: boolean;
  onSubmit: (data: CountryFormData) => void | Promise<void>;
  onCancel: () => void;
  /** Reports whether the form has unsaved changes since it was last reset. */
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

export function CountryForm({
  mode,
  country,
  isLoading = false,
  onSubmit,
  onCancel,
  onDirtyChange,
}: CountryFormProps) {
  const t = useTranslation();
  const [form, setForm] = useState<CountryFormData>(createEmptyCountryForm());
  const [titleErrors, setTitleErrors] = useState<Partial<Record<"en" | "ar", string>>>({});
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setForm(country ? countryToFormData(country) : createEmptyCountryForm());
    setTitleErrors({});
    setIsDirty(false);
  }, [country, mode]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const updateForm = (updater: (current: CountryFormData) => CountryFormData) => {
    setForm(updater);
    setIsDirty(true);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Partial<Record<"en" | "ar", string>> = {};
    if (!form.translations.en?.title?.trim() && !form.translations.ar?.title?.trim()) {
      nextErrors.en = t.required;
    }
    setTitleErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    void onSubmit(form);
  };

  return (
    <CrudFormShell onSubmit={handleSubmit} className="space-y-4">
      <FormSection title={t.countryContent}>
        <TitleTranslationFields
          value={form.translations}
          onChange={(translations) => updateForm((current) => ({ ...current, translations }))}
          titleErrors={titleErrors}
          layout="tabs"
          autoFocusFirstField
        />
      </FormSection>

      <FormSection title={t.countryDetails}>
        <TextField
          label={t.countryIso}
          value={form.countryIso ?? ""}
          onChange={(event) =>
            updateForm((current) => ({
              ...current,
              countryIso: event.target.value.toUpperCase(),
            }))
          }
          maxLength={10}
          autoComplete="off"
          placeholder="KWT"
        />
        <ToggleField
          label={t.publish}
          checked={form.publish ?? true}
          onCheckedChange={(checked) => updateForm((current) => ({ ...current, publish: checked }))}
        />
      </FormSection>

      <CrudFormFooter
        submitLabel={mode === "create" ? t.addCountry : t.save}
        cancelLabel={t.cancel}
        onCancel={onCancel}
        isLoading={isLoading}
        loadingLabel={t.loadingMessage}
      />
    </CrudFormShell>
  );
}
