import { useState } from "react";

import {
  type Area,
  type AreaFormData,
  type AreaLocaleField,
  areaToFormData,
  createEmptyAreaForm,
} from "@/features/areas/types/areas.types";
import {
  hasLocaleFieldErrors,
  type LocaleFieldDefinition,
  type LocaleFieldErrors,
  LocaleFieldsTabs,
  TextField,
  ToggleField,
  validateLocaleFields,
} from "@/shared/components";
import { CrudFormFooter, CrudFormSection, CrudFormShell, useCrudFormState } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type AreaFormProps = {
  mode: "create" | "edit";
  area?: Area | null;
  isLoading?: boolean;
  onSubmit: (data: AreaFormData) => void | Promise<void>;
  onCancel: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
};

const buildForm = (area?: Area | null) => (area ? areaToFormData(area) : createEmptyAreaForm());

export function AreaForm({ mode, area, isLoading, onSubmit, onCancel, onDirtyChange }: AreaFormProps) {
  const t = useTranslation();
  const { form, update } = useCrudFormState(area, buildForm, mode, onDirtyChange);
  const [errors, setErrors] = useState<LocaleFieldErrors<AreaLocaleField>>({});

  const fields: LocaleFieldDefinition<AreaLocaleField>[] = [
    { key: "name", label: t.fieldName, required: true, maxLength: 255 },
  ];

  return (
    <CrudFormShell
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const nextErrors = validateLocaleFields(form.translations, fields, t.required);
        setErrors(nextErrors);
        if (hasLocaleFieldErrors(nextErrors)) return;
        void onSubmit(form);
      }}
    >
      <CrudFormSection title={t.sectionContent}>
        <LocaleFieldsTabs
          fields={fields}
          value={form.translations}
          onChange={(translations) => update({ translations })}
          errors={errors}
          autoFocusFirstField
        />
      </CrudFormSection>

      <CrudFormSection title={t.sectionDetails}>
        <TextField
          label={t.slug}
          value={form.slug}
          onChange={(event) => update({ slug: event.target.value })}
          helperText={t.slugHelper}
          maxLength={140}
          dir="ltr"
        />
        <TextField
          label={t.sortOrder}
          type="number"
          min={0}
          value={form.sortOrder}
          onChange={(event) => update({ sortOrder: event.target.value })}
          helperText={t.sortOrderHelper}
        />
        <ToggleField
          label={t.publish}
          checked={form.publish}
          onCheckedChange={(publish) => update({ publish })}
        />
      </CrudFormSection>

      <CrudFormFooter
        submitLabel={mode === "create" ? t.addArea : t.save}
        cancelLabel={t.cancel}
        onCancel={onCancel}
        isLoading={isLoading}
        loadingLabel={t.loadingMessage}
      />
    </CrudFormShell>
  );
}
