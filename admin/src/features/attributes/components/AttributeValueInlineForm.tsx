import { useEffect, useState } from "react";

import { useAttributeValueMutations } from "@/features/attribute-values/hooks/use-attribute-value-mutations";
import type {
  AttributeValue,
  AttributeValueFormData,
} from "@/features/attribute-values/types/attribute-values.types";
import {
  attributeValueToFormData,
  createEmptyAttributeValueForm,
} from "@/features/attribute-values/types/attribute-values.types";
import { AppButton, ToggleField } from "@/shared/components";
import { TitleTranslationFields } from "@/shared/components/forms/TitleTranslationFields";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type AttributeValueInlineFormProps = {
  mode: "create" | "edit";
  attributeId: number;
  attributeValue?: AttributeValue | null;
  onSuccess: () => void | Promise<void>;
  onCancel: () => void;
};

export function AttributeValueInlineForm({
  mode,
  attributeId,
  attributeValue,
  onSuccess,
  onCancel,
}: AttributeValueInlineFormProps) {
  const t = useTranslation();
  const [form, setForm] = useState<AttributeValueFormData>(createEmptyAttributeValueForm());
  const [titleErrors, setTitleErrors] = useState<Partial<Record<"en" | "ar", string>>>({});

  const { save, isSaving } = useAttributeValueMutations({
    onSuccess,
  });

  useEffect(() => {
    if (attributeValue) {
      setForm(attributeValueToFormData(attributeValue));
    } else {
      setForm({
        ...createEmptyAttributeValueForm(),
        attributeId,
      });
    }
    setTitleErrors({});
  }, [attributeId, attributeValue, mode]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: Partial<Record<"en" | "ar", string>> = {};
    if (!form.translations.en?.title?.trim() && !form.translations.ar?.title?.trim()) {
      nextErrors.en = t.required;
    }
    setTitleErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    await save(mode, { ...form, attributeId }, attributeValue ?? undefined);
    onCancel();
  };

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-4"
    >
      <TitleTranslationFields
        value={form.translations}
        onChange={(translations) => setForm((current) => ({ ...current, translations }))}
        titleErrors={titleErrors}
        layout="stacked"
        autoFocusFirstField
      />

      <ToggleField
        label={t.publish}
        checked={form.publish ?? true}
        onCheckedChange={(checked) => setForm((current) => ({ ...current, publish: checked }))}
      />

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <AppButton type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
          {t.cancel}
        </AppButton>
        <AppButton type="submit" isLoading={isSaving} loadingText={t.loadingMessage}>
          {mode === "create" ? t.addAttributeValue : t.save}
        </AppButton>
      </div>
    </form>
  );
}
