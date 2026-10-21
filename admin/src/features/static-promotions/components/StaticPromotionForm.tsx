import { useEffect, useState } from "react";

import type {
  StaticPromotion,
  StaticPromotionFormData,
} from "@/features/static-promotions/types/static-promotions.types";
import {
  createEmptyStaticPromotionForm,
  staticPromotionToFormData,
} from "@/features/static-promotions/types/static-promotions.types";
import { SelectField, TextField, ToggleField } from "@/shared/components";
import { LocaleImageUploadFields } from "@/shared/components/forms/LocaleImageUploadFields";
import { CrudFormFooter, CrudFormShell } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { useStaticPromotionTypeOptions } from "@/shared/hooks/use-options";

type StaticPromotionFormProps = {
  mode: "create" | "edit";
  promotion?: StaticPromotion | null;
  isLoading?: boolean;
  onSubmit: (data: StaticPromotionFormData) => void | Promise<void>;
  onCancel: () => void;
};

export function StaticPromotionForm({
  mode,
  promotion,
  isLoading = false,
  onSubmit,
  onCancel,
}: StaticPromotionFormProps) {
  const t = useTranslation();
  const { options: typeOptions, isLoading: isTypeOptionsLoading } = useStaticPromotionTypeOptions();
  const [form, setForm] = useState<StaticPromotionFormData>(createEmptyStaticPromotionForm());
  const [imageErrors, setImageErrors] = useState<Partial<Record<"en" | "ar", string>>>({});

  useEffect(() => {
    setForm(promotion ? staticPromotionToFormData(promotion) : createEmptyStaticPromotionForm());
    setImageErrors({});
  }, [promotion, mode]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Partial<Record<"en" | "ar", string>> = {};

    if (mode === "create") {
      const hasEnImage = form.translations.en?.file instanceof File || form.translations.en?.previewUrl;
      const hasArImage = form.translations.ar?.file instanceof File || form.translations.ar?.previewUrl;
      if (!hasEnImage && !hasArImage) {
        nextErrors.en = t.required;
      }
    }

    setImageErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    void onSubmit(form);
  };

  return (
    <CrudFormShell onSubmit={handleSubmit}>
      <SelectField
        label={t.promotionType}
        value={form.type}
        onValueChange={(value) =>
          setForm((current) => ({ ...current, type: value as StaticPromotionFormData["type"] }))
        }
        options={typeOptions}
        required
        disabled={isTypeOptionsLoading}
      />

      <TextField
        label={t.position}
        type="number"
        min={0}
        value={String(form.position)}
        onChange={(event) =>
          setForm((current) => ({ ...current, position: Number(event.target.value) || 0 }))
        }
        required
      />

      <TextField
        label={t.link}
        value={form.link ?? ""}
        onChange={(event) => setForm((current) => ({ ...current, link: event.target.value }))}
      />

      <ToggleField
        label={t.publish}
        checked={form.publish ?? true}
        onCheckedChange={(checked) => setForm((current) => ({ ...current, publish: checked }))}
      />

      <LocaleImageUploadFields
        value={form.translations}
        onChange={(translations) => setForm((current) => ({ ...current, translations }))}
        errors={imageErrors}
        layout="tabs"
      />

      <CrudFormFooter
        submitLabel={mode === "create" ? t.addStaticPromotion : t.save}
        cancelLabel={t.cancel}
        onCancel={onCancel}
        isLoading={isLoading}
        loadingLabel={t.loadingMessage}
      />
    </CrudFormShell>
  );
}
