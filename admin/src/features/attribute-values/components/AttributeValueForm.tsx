import { type ReactNode, useEffect, useState } from "react";

import { AttributePicker } from "@/features/attribute-values/components/AttributePicker";
import type {
  AttributeValue,
  AttributeValueFormData,
} from "@/features/attribute-values/types/attribute-values.types";
import {
  attributeValueToFormData,
  createEmptyAttributeValueForm,
} from "@/features/attribute-values/types/attribute-values.types";
import { ToggleField } from "@/shared/components";
import { TitleTranslationFields } from "@/shared/components/forms/TitleTranslationFields";
import { CrudFormFooter, CrudFormShell } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type AttributeValueFormProps = {
  mode: "create" | "edit";
  attributeValue?: AttributeValue | null;
  fixedAttributeId?: number;
  isLoading?: boolean;
  onSubmit: (data: AttributeValueFormData) => void | Promise<void>;
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

export function AttributeValueForm({
  mode,
  attributeValue,
  fixedAttributeId,
  isLoading = false,
  onSubmit,
  onCancel,
  onDirtyChange,
}: AttributeValueFormProps) {
  const t = useTranslation();
  const [form, setForm] = useState<AttributeValueFormData>(createEmptyAttributeValueForm());
  const [titleErrors, setTitleErrors] = useState<Partial<Record<"en" | "ar", string>>>({});
  const [attributeError, setAttributeError] = useState<string | undefined>();
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (attributeValue) {
      setForm(attributeValueToFormData(attributeValue));
    } else {
      setForm({
        ...createEmptyAttributeValueForm(),
        attributeId: fixedAttributeId ?? null,
      });
    }
    setTitleErrors({});
    setAttributeError(undefined);
    setIsDirty(false);
  }, [attributeValue, fixedAttributeId, mode]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const updateForm = (updater: (current: AttributeValueFormData) => AttributeValueFormData) => {
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

    let hasError = Object.keys(nextErrors).length > 0;
    const resolvedAttributeId = fixedAttributeId ?? form.attributeId;
    if (resolvedAttributeId == null) {
      setAttributeError(t.required);
      hasError = true;
    } else {
      setAttributeError(undefined);
    }

    if (hasError) return;
    void onSubmit({
      ...form,
      attributeId: resolvedAttributeId,
    });
  };

  return (
    <CrudFormShell onSubmit={handleSubmit} className="space-y-4">
      <FormSection title={t.attributeValueContent}>
        {fixedAttributeId == null ? (
          <AttributePicker
            value={form.attributeId}
            onChange={(attributeId) => updateForm((current) => ({ ...current, attributeId }))}
            disabled={isLoading}
            error={attributeError}
          />
        ) : null}
        <TitleTranslationFields
          value={form.translations}
          onChange={(translations) => updateForm((current) => ({ ...current, translations }))}
          titleErrors={titleErrors}
          layout="tabs"
          autoFocusFirstField
        />
      </FormSection>

      <FormSection title={t.attributeValueVisibility}>
        <ToggleField
          label={t.publish}
          checked={form.publish ?? true}
          onCheckedChange={(checked) => updateForm((current) => ({ ...current, publish: checked }))}
        />
      </FormSection>

      <CrudFormFooter
        submitLabel={mode === "create" ? t.addAttributeValue : t.save}
        cancelLabel={t.cancel}
        onCancel={onCancel}
        isLoading={isLoading}
        loadingLabel={t.loadingMessage}
      />
    </CrudFormShell>
  );
}
