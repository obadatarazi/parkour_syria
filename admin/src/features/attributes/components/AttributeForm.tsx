import { type ReactNode, useEffect, useState } from "react";

import type { Attribute, AttributeFormData } from "@/features/attributes/types/attributes.types";
import {
  attributeToFormData,
  createEmptyAttributeForm,
} from "@/features/attributes/types/attributes.types";
import { ToggleField } from "@/shared/components";
import { TitleTranslationFields } from "@/shared/components/forms/TitleTranslationFields";
import { CrudFormFooter, CrudFormShell } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type AttributeFormProps = {
  mode: "create" | "edit";
  attribute?: Attribute | null;
  isLoading?: boolean;
  onSubmit: (data: AttributeFormData) => void | Promise<void>;
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

export function AttributeForm({
  mode,
  attribute,
  isLoading = false,
  onSubmit,
  onCancel,
  onDirtyChange,
}: AttributeFormProps) {
  const t = useTranslation();
  const [form, setForm] = useState<AttributeFormData>(createEmptyAttributeForm());
  const [titleErrors, setTitleErrors] = useState<Partial<Record<"en" | "ar", string>>>({});
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setForm(attribute ? attributeToFormData(attribute) : createEmptyAttributeForm());
    setTitleErrors({});
    setIsDirty(false);
  }, [attribute, mode]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const updateForm = (updater: (current: AttributeFormData) => AttributeFormData) => {
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
      <FormSection title={t.attributeContent}>
        <TitleTranslationFields
          value={form.translations}
          onChange={(translations) => updateForm((current) => ({ ...current, translations }))}
          titleErrors={titleErrors}
          layout="tabs"
          autoFocusFirstField
        />
      </FormSection>

      <FormSection title={t.attributeVisibility}>
        <ToggleField
          label={t.publish}
          checked={form.publish ?? true}
          onCheckedChange={(checked) => updateForm((current) => ({ ...current, publish: checked }))}
        />
      </FormSection>

      <CrudFormFooter
        submitLabel={mode === "create" ? t.addAttribute : t.save}
        cancelLabel={t.cancel}
        onCancel={onCancel}
        isLoading={isLoading}
        loadingLabel={t.loadingMessage}
      />
    </CrudFormShell>
  );
}
