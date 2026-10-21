import { useEffect, useMemo, useState } from "react";

import type {
  MultiTypeSetting,
  MultiTypeSettingFormData,
  MultiTypeSettingType,
} from "@/features/settings/types/settings.types";
import {
  createEmptySettingForm,
  settingToFormData,
} from "@/features/settings/types/settings.types";
import { parseSettingBoolean } from "@/features/settings/utils/setting-display";
import { SelectField, TextAreaField, TextField, ToggleField } from "@/shared/components";
import { CrudFormFooter, CrudFormShell } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { useMultiTypeSettingTypeOptions } from "@/shared/hooks/use-options";
import type { FieldErrors } from "@/shared/types";

type SettingFormProps = {
  mode: "create" | "edit";
  setting?: MultiTypeSetting | null;
  isLoading?: boolean;
  /** When false, the value field cannot be changed (e.g. tax rate while inactive). */
  valueEditable?: boolean;
  valueLockedHint?: string;
  onSubmit: (data: MultiTypeSettingFormData) => void | Promise<void>;
  onCancel: () => void;
};

type SettingFormErrors = FieldErrors<"settingKey" | "value" | "type">;

function resolveInputType(type: MultiTypeSettingType): "text" | "email" | "tel" | "url" {
  if (type === "EMAIL") return "email";
  if (type === "PHONE_NUMBER") return "tel";
  if (type === "LINK") return "url";
  return "text";
}

export function SettingForm({
  mode,
  setting,
  isLoading = false,
  valueEditable = true,
  valueLockedHint,
  onSubmit,
  onCancel,
}: SettingFormProps) {
  const t = useTranslation();
  const { options: typeOptions, isLoading: isTypeOptionsLoading } = useMultiTypeSettingTypeOptions();
  const [form, setForm] = useState<MultiTypeSettingFormData>(createEmptySettingForm());
  const [errors, setErrors] = useState<SettingFormErrors>({});

  useEffect(() => {
    setForm(setting ? settingToFormData(setting) : createEmptySettingForm());
    setErrors({});
  }, [setting, mode]);

  const valueInputType = useMemo(() => resolveInputType(form.type), [form.type]);
  const typeLabel =
    typeOptions.find((option) => option.value === form.type)?.label ?? form.type;
  const isBooleanType = form.type === "BOOLEAN";

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!valueEditable) return;

    const nextErrors: SettingFormErrors = {};

    if (mode === "create" && !form.settingKey.trim()) {
      nextErrors.settingKey = t.required;
    }
    if (!form.type) nextErrors.type = t.required;

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    void onSubmit(form);
  };

  return (
    <CrudFormShell onSubmit={handleSubmit}>
      {mode === "create" ? (
        <TextField
          label={t.settingKey}
          value={form.settingKey}
          onChange={(event) => {
            setForm((current) => ({ ...current, settingKey: event.target.value.toUpperCase() }));
            if (errors.settingKey) setErrors((current) => ({ ...current, settingKey: undefined }));
          }}
          error={errors.settingKey}
          required
          placeholder="FACEBOOK_LINK"
        />
      ) : (
        <TextField label={t.settingKey} value={form.settingKey} readOnly />
      )}

      {mode === "create" ? (
        <SelectField
          label={t.settingType}
          value={form.type}
          options={typeOptions}
          onValueChange={(value) =>
            setForm((current) => ({ ...current, type: value as MultiTypeSettingType }))
          }
          error={errors.type}
          required
          disabled={isTypeOptionsLoading}
        />
      ) : (
        <TextField label={t.settingType} value={typeLabel} readOnly />
      )}

      {isBooleanType ? (
        <ToggleField
          label={t.value}
          checked={parseSettingBoolean(form.value)}
          onCheckedChange={(checked) =>
            setForm((current) => ({ ...current, value: checked ? "true" : "false" }))
          }
          description={!valueEditable ? valueLockedHint : undefined}
          disabled={!valueEditable || isLoading}
        />
      ) : (
        <TextField
          label={t.value}
          type={valueInputType}
          dir={form.type === "PHONE_NUMBER" ? "ltr" : undefined}
          value={form.value}
          onChange={(event) => {
            setForm((current) => ({ ...current, value: event.target.value }));
            if (errors.value) setErrors((current) => ({ ...current, value: undefined }));
          }}
          error={errors.value}
          helperText={!valueEditable ? valueLockedHint : undefined}
          disabled={!valueEditable || isLoading}
          readOnly={!valueEditable}
          className={form.type === "PHONE_NUMBER" ? "rtl:text-right" : undefined}
        />
      )}

      {mode === "create" ? (
        <TextAreaField
          label={t.description}
          value={form.description ?? ""}
          onChange={(event) =>
            setForm((current) => ({ ...current, description: event.target.value }))
          }
          rows={3}
        />
      ) : form.description ? (
        <TextAreaField label={t.description} value={form.description} readOnly rows={3} />
      ) : null}

      <CrudFormFooter
        submitLabel={mode === "create" ? t.addSetting : t.save}
        cancelLabel={t.cancel}
        onCancel={onCancel}
        isLoading={isLoading}
        loadingLabel={t.loadingMessage}
        submitDisabled={!valueEditable}
      />
    </CrudFormShell>
  );
}
