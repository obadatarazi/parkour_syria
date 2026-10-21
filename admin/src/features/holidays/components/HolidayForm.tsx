import { type ReactNode, useEffect, useState } from "react";

import type { Holiday, HolidayFormData } from "@/features/holidays/types/holidays.types";
import {
  createEmptyHolidayForm,
  holidayToFormData,
} from "@/features/holidays/types/holidays.types";
import { TextAreaField, TextField, ToggleField } from "@/shared/components";
import { CrudFormFooter, CrudFormShell } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type HolidayFormProps = {
  mode: "create" | "edit";
  entity?: Holiday | null;
  isLoading?: boolean;
  onSubmit: (data: HolidayFormData) => void | Promise<void>;
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

export function HolidayForm({
  mode,
  entity,
  isLoading = false,
  onSubmit,
  onCancel,
  onDirtyChange,
}: HolidayFormProps) {
  const t = useTranslation();
  const [form, setForm] = useState<HolidayFormData>(createEmptyHolidayForm());
  const [dateError, setDateError] = useState<string | undefined>();
  const [nameError, setNameError] = useState<string | undefined>();
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setForm(entity ? holidayToFormData(entity) : createEmptyHolidayForm());
    setDateError(undefined);
    setNameError(undefined);
    setIsDirty(false);
  }, [entity, mode]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const updateForm = (updater: (current: HolidayFormData) => HolidayFormData) => {
    setForm(updater);
    setIsDirty(true);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextDateError = !form.date ? t.required : undefined;
    const nextNameError = !form.name.trim() ? t.required : undefined;
    setDateError(nextDateError);
    setNameError(nextNameError);
    if (nextDateError || nextNameError) return;
    void onSubmit(form);
  };

  return (
    <CrudFormShell onSubmit={handleSubmit} className="space-y-4">
      <FormSection title={t.holidayDetails}>
        <TextField
          label={t.holidayDate}
          type="date"
          value={form.date ?? ""}
          onChange={(event) =>
            updateForm((current) => ({
              ...current,
              date: event.target.value || null,
            }))
          }
          error={dateError}
          required
        />

        <TextField
          label={t.holidayName}
          type="text"
          value={form.name}
          onChange={(event) =>
            updateForm((current) => ({
              ...current,
              name: event.target.value,
            }))
          }
          error={nameError}
          required
        />

        <TextAreaField
          label={t.description}
          value={form.description ?? ""}
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
            updateForm((current) => ({
              ...current,
              description: event.target.value || null,
            }))
          }
          rows={3}
        />

        <ToggleField
          label={t.status}
          checked={form.isActive ?? true}
          onCheckedChange={(checked) => updateForm((current) => ({ ...current, isActive: checked }))}
        />
      </FormSection>

      <CrudFormFooter
        submitLabel={mode === "create" ? t.addHoliday : t.save}
        cancelLabel={t.cancel}
        onCancel={onCancel}
        isLoading={isLoading}
        loadingLabel={t.loadingMessage}
      />
    </CrudFormShell>
  );
}
