import { type ReactNode, useEffect, useState } from "react";

import type { Brand, BrandFormData } from "@/features/brands/types/brands.types";
import { brandToFormData, createEmptyBrandForm } from "@/features/brands/types/brands.types";
import { MediaImage, ToggleField } from "@/shared/components";
import { TranslationFields } from "@/shared/components/forms/TranslationFields";
import { CrudFileUpload, CrudFormFooter, CrudFormShell } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type BrandFormProps = {
  mode: "create" | "edit";
  brand?: Brand | null;
  isLoading?: boolean;
  onSubmit: (data: BrandFormData) => void | Promise<void>;
  onCancel: () => void;
  /** Reports whether the form has unsaved changes since it was last reset. */
  onDirtyChange?: (isDirty: boolean) => void;
};

function FormSection({
  title,
  description,
  children,
  dataGuidance,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  dataGuidance?: string;
}) {
  return (
    <section className="space-y-4 rounded-xl border border-border bg-muted/15 p-4" data-guidance={dataGuidance}>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function BrandForm({
  mode,
  brand,
  isLoading = false,
  onSubmit,
  onCancel,
  onDirtyChange,
}: BrandFormProps) {
  const t = useTranslation();
  const [form, setForm] = useState<BrandFormData>(createEmptyBrandForm());
  const [titleErrors, setTitleErrors] = useState<Partial<Record<"en" | "ar", string>>>({});
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setForm(brand ? brandToFormData(brand) : createEmptyBrandForm());
    setTitleErrors({});
    setIsDirty(false);
  }, [brand, mode]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const updateForm = (updater: (current: BrandFormData) => BrandFormData) => {
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
      <FormSection title={t.brandContent}>
        <TranslationFields
          value={form.translations}
          onChange={(translations) => updateForm((current) => ({ ...current, translations }))}
          titleErrors={titleErrors}
          showSlugPreview
          layout="tabs"
          autoFocusFirstField
        />
      </FormSection>

      <FormSection title={t.brandMedia}>
        {brand?.logoFileUrl && !form.logo ? (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">{t.currentImage}</p>
            <div className="overflow-hidden rounded-lg border border-border">
              <MediaImage src={brand.logoFileUrl} alt="" className="max-h-44 w-full object-cover" />
            </div>
          </div>
        ) : null}

        <CrudFileUpload
          label={t.brandLogo}
          accept="image/*"
          helperText={brand?.logoFileUrl ? t.replaceImageHint : undefined}
          value={form.logo ?? null}
          onFileSelect={(file) => updateForm((current) => ({ ...current, logo: file }))}
        />
      </FormSection>

      <FormSection title={t.brandVisibility} dataGuidance="crud-form-visibility">
        <ToggleField
          label={t.publish}
          checked={form.publish ?? true}
          onCheckedChange={(checked) => updateForm((current) => ({ ...current, publish: checked }))}
        />
      </FormSection>

      <CrudFormFooter
        submitLabel={mode === "create" ? t.addBrand : t.save}
        cancelLabel={t.cancel}
        onCancel={onCancel}
        isLoading={isLoading}
        loadingLabel={t.loadingMessage}
      />
    </CrudFormShell>
  );
}
