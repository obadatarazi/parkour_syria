import { type ReactNode, useEffect, useState } from "react";

import { CategoryParentsPicker } from "@/features/categories/components/CategoryParentsPicker";
import type { Category, CategoryFormData } from "@/features/categories/types/categories.types";
import {
  categoryToFormData,
  createEmptyCategoryForm,
} from "@/features/categories/types/categories.types";
import { categoryAllowsMerchandisingFlags } from "@/features/categories/utils/category-tree.utils";
import { MediaImage, ToggleField } from "@/shared/components";
import { TranslationFields } from "@/shared/components/forms/TranslationFields";
import { CrudFileUpload, CrudFormFooter, CrudFormShell } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type CategoryFormProps = {
  mode: "create" | "edit";
  category?: Category | null;
  /**
   * Rising-edge create-drawer session id. Each new Create open gets a fresh key
   * so prior drafts cannot leak across close/reopen (mirrors Roles).
   */
  createSessionKey?: number;
  isLoading?: boolean;
  onSubmit: (data: CategoryFormData) => void | Promise<void>;
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

export function CategoryForm({
  mode,
  category,
  createSessionKey = 0,
  isLoading = false,
  onSubmit,
  onCancel,
  onDirtyChange,
}: CategoryFormProps) {
  const t = useTranslation();
  const [form, setForm] = useState<CategoryFormData>(createEmptyCategoryForm());
  const [titleErrors, setTitleErrors] = useState<Partial<Record<"en" | "ar", string>>>({});
  const [isDirty, setIsDirty] = useState(false);

  // Create resets per createSessionKey; edit resets when category/mode change.
  useEffect(() => {
    setForm(category ? categoryToFormData(category) : createEmptyCategoryForm());
    setTitleErrors({});
    setIsDirty(false);
  }, [category, mode, createSessionKey]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const updateForm = (updater: (current: CategoryFormData) => CategoryFormData) => {
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

  // Homepage / featured require children; create is exempt (backend allows).
  const canUseMerchandisingFlags =
    mode === "create" || (category != null && categoryAllowsMerchandisingFlags(category));

  return (
    <CrudFormShell onSubmit={handleSubmit} className="space-y-4">
      <FormSection title={t.categoryContent}>
        <TranslationFields
          value={form.translations}
          onChange={(translations) => updateForm((current) => ({ ...current, translations }))}
          titleErrors={titleErrors}
          showSlugPreview
          layout="tabs"
          autoFocusFirstField
        />
      </FormSection>

      <FormSection title={t.categoryMedia}>
        {category?.featureImageFileUrl && !form.featureImage ? (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">{t.currentImage}</p>
            <div className="overflow-hidden rounded-lg border border-border">
              <MediaImage
                src={category.featureImageFileUrl}
                alt=""
                className="max-h-44 w-full object-cover"
              />
            </div>
          </div>
        ) : null}

        <CrudFileUpload
          label={t.featureImage}
          accept="image/*"
          helperText={category?.featureImageFileUrl ? t.replaceImageHint : undefined}
          value={form.featureImage ?? null}
          onFileSelect={(file) => updateForm((current) => ({ ...current, featureImage: file }))}
        />
      </FormSection>

      <FormSection title={t.categoryHierarchy}>
        <CategoryParentsPicker
          value={form.parentCategoryIds}
          onChange={(parentCategoryIds) =>
            updateForm((current) => ({ ...current, parentCategoryIds }))
          }
          excludeCategoryId={mode === "edit" && category ? category.id : undefined}
          disabled={isLoading}
        />
      </FormSection>

      <FormSection
        title={t.categoryVisibility}
        description={
          canUseMerchandisingFlags ? undefined : t.categoryLeafMerchandisingHint
        }
        dataGuidance="crud-form-visibility"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <ToggleField
            label={t.publish}
            checked={form.publish ?? true}
            onCheckedChange={(checked) => updateForm((current) => ({ ...current, publish: checked }))}
          />
          <ToggleField
            label={t.showMenu}
            checked={form.showMenu ?? false}
            onCheckedChange={(checked) =>
              updateForm((current) => ({ ...current, showMenu: checked }))
            }
          />
          {canUseMerchandisingFlags ? (
            <>
              <ToggleField
                label={t.showInHomePage}
                checked={form.showInHomePage ?? false}
                onCheckedChange={(checked) =>
                  updateForm((current) => ({ ...current, showInHomePage: checked }))
                }
              />
              <ToggleField
                label={t.featured}
                checked={form.feature ?? false}
                onCheckedChange={(checked) =>
                  updateForm((current) => ({ ...current, feature: checked }))
                }
              />
            </>
          ) : null}
        </div>
      </FormSection>

      <CrudFormFooter
        submitLabel={mode === "create" ? t.addCategory : t.save}
        cancelLabel={t.cancel}
        onCancel={onCancel}
        isLoading={isLoading}
        loadingLabel={t.loadingMessage}
      />
    </CrudFormShell>
  );
}
