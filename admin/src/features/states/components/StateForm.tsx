import { type ReactNode, useEffect, useState } from "react";

import { useCountryOptions } from "@/features/countries/hooks/use-countries-list";
import type { State, StateFormData } from "@/features/states/types/states.types";
import { createEmptyStateForm, stateToFormData } from "@/features/states/types/states.types";
import { SelectField, ToggleField } from "@/shared/components";
import { TitleTranslationFields } from "@/shared/components/forms/TitleTranslationFields";
import { CrudFormFooter, CrudFormShell } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type StateFormProps = {
  mode: "create" | "edit";
  state?: State | null;
  isLoading?: boolean;
  onSubmit: (data: StateFormData) => void | Promise<void>;
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

export function StateForm({
  mode,
  state,
  isLoading = false,
  onSubmit,
  onCancel,
  onDirtyChange,
}: StateFormProps) {
  const t = useTranslation();
  const { options: countryOptions, isLoading: isCountryOptionsLoading } = useCountryOptions();
  const [form, setForm] = useState<StateFormData>(createEmptyStateForm());
  const [titleErrors, setTitleErrors] = useState<Partial<Record<"en" | "ar", string>>>({});
  const [countryError, setCountryError] = useState<string | undefined>();
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setForm(state ? stateToFormData(state) : createEmptyStateForm());
    setTitleErrors({});
    setCountryError(undefined);
    setIsDirty(false);
  }, [state, mode]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const updateForm = (updater: (current: StateFormData) => StateFormData) => {
    setForm(updater);
    setIsDirty(true);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Partial<Record<"en" | "ar", string>> = {};
    if (!form.translations.en?.title?.trim() && !form.translations.ar?.title?.trim()) {
      nextErrors.en = t.required;
    }
    const nextCountryError = !form.countryId ? t.required : undefined;
    setTitleErrors(nextErrors);
    setCountryError(nextCountryError);
    if (Object.keys(nextErrors).length > 0 || nextCountryError) return;
    void onSubmit(form);
  };

  return (
    <CrudFormShell onSubmit={handleSubmit} className="space-y-4">
      <FormSection title={t.stateContent}>
        <SelectField
          label={t.country}
          value={form.countryId ? String(form.countryId) : ""}
          onValueChange={(value) =>
            updateForm((current) => ({
              ...current,
              countryId: value ? Number(value) : null,
            }))
          }
          options={countryOptions}
          placeholder={t.selectCountry}
          error={countryError}
          required
          disabled={isCountryOptionsLoading}
        />

        <TitleTranslationFields
          value={form.translations}
          onChange={(translations) => updateForm((current) => ({ ...current, translations }))}
          titleErrors={titleErrors}
          layout="tabs"
        />
      </FormSection>

      <FormSection title={t.stateDetails}>
        <ToggleField
          label={t.publish}
          checked={form.publish ?? true}
          onCheckedChange={(checked) => updateForm((current) => ({ ...current, publish: checked }))}
        />
      </FormSection>

      <CrudFormFooter
        submitLabel={mode === "create" ? t.addState : t.save}
        cancelLabel={t.cancel}
        onCancel={onCancel}
        isLoading={isLoading}
        loadingLabel={t.loadingMessage}
      />
    </CrudFormShell>
  );
}
