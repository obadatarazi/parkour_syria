import { useState } from "react";

import {
  type BlogCategory,
  type BlogCategoryFormData,
  type BlogCategoryLocaleField,
  blogCategoryToFormData,
  createEmptyBlogCategoryForm,
} from "@/features/blog-categories/types/blog-categories.types";
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

type BlogCategoryFormProps = {
  mode: "create" | "edit";
  blogCategory?: BlogCategory | null;
  isLoading?: boolean;
  onSubmit: (data: BlogCategoryFormData) => void | Promise<void>;
  onCancel: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
};

const buildForm = (blogCategory?: BlogCategory | null) => (blogCategory ? blogCategoryToFormData(blogCategory) : createEmptyBlogCategoryForm());

export function BlogCategoryForm({ mode, blogCategory, isLoading, onSubmit, onCancel, onDirtyChange }: BlogCategoryFormProps) {
  const t = useTranslation();
  const { form, update } = useCrudFormState(blogCategory, buildForm, mode, onDirtyChange);
  const [errors, setErrors] = useState<LocaleFieldErrors<BlogCategoryLocaleField>>({});

  const fields: LocaleFieldDefinition<BlogCategoryLocaleField>[] = [
    { key: "title", label: t.fieldTitle, required: true, maxLength: 255 },
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
        submitLabel={mode === "create" ? t.addBlogCategory : t.save}
        cancelLabel={t.cancel}
        onCancel={onCancel}
        isLoading={isLoading}
        loadingLabel={t.loadingMessage}
      />
    </CrudFormShell>
  );
}
