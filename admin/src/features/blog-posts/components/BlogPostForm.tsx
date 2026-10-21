import { useState } from "react";

import { useBlogCategoryOptions } from "@/features/blog-categories/hooks/use-blog-categories-list";
import {
  type BlogPost,
  type BlogPostFormData,
  type BlogPostLocaleField,
  blogPostToFormData,
  createEmptyBlogPostForm,
} from "@/features/blog-posts/types/blog-posts.types";
import {
  hasLocaleFieldErrors,
  ImageField,
  type LocaleFieldDefinition,
  type LocaleFieldErrors,
  LocaleFieldsTabs,
  SelectField,
  TextField,
  ToggleField,
  validateLocaleFields,
} from "@/shared/components";
import {
  CrudEditorLayout,
  CrudFormFooter,
  CrudFormSection,
  CrudFormShell,
  useCrudFormState,
} from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type BlogPostFormProps = {
  mode: "create" | "edit";
  post?: BlogPost | null;
  isLoading?: boolean;
  onSubmit: (data: BlogPostFormData) => void | Promise<void>;
  onCancel: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
};

const NO_CATEGORY = "none";

const buildForm = (post?: BlogPost | null) =>
  post ? blogPostToFormData(post) : createEmptyBlogPostForm();

/** The current local time as a datetime-local value. */
function nowForInput(): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

export function BlogPostForm({
  mode,
  post,
  isLoading,
  onSubmit,
  onCancel,
  onDirtyChange,
}: BlogPostFormProps) {
  const t = useTranslation();
  const { form, update } = useCrudFormState(post, buildForm, mode, onDirtyChange);
  const [errors, setErrors] = useState<LocaleFieldErrors<BlogPostLocaleField>>({});
  const { options: categoryOptions } = useBlogCategoryOptions();

  const contentFields: LocaleFieldDefinition<BlogPostLocaleField>[] = [
    { key: "title", label: t.fieldTitle, required: true, maxLength: 255 },
    { key: "author", label: t.fieldAuthor, maxLength: 120 },
    { key: "excerpt", label: t.fieldExcerpt, multiline: true, rows: 2 },
    { key: "body", label: t.fieldBody, richText: true, rows: 16 },
  ];
  const seoFields: LocaleFieldDefinition<BlogPostLocaleField>[] = [
    { key: "seo_title", label: t.fieldSeoTitle, maxLength: 255 },
    { key: "seo_description", label: t.fieldSeoDescription, multiline: true, rows: 2, maxLength: 500 },
  ];

  return (
    <CrudFormShell
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const nextErrors = validateLocaleFields(form.translations, contentFields, t.required);
        setErrors(nextErrors);
        if (hasLocaleFieldErrors(nextErrors)) return;
        void onSubmit(
          form.publish && !form.publishedAt ? { ...form, publishedAt: nowForInput() } : form,
        );
      }}
    >
      <CrudEditorLayout
        main={
          <CrudFormSection title={t.sectionContent}>
            <LocaleFieldsTabs
              fields={contentFields}
              value={form.translations}
              onChange={(translations) => update({ translations })}
              errors={errors}
              autoFocusFirstField
            />
          </CrudFormSection>
        }
        aside={
          <>
            <CrudFormSection title={t.sectionDetails}>
              <ToggleField
                label={t.publish}
                checked={form.publish}
                onCheckedChange={(publish) => update({ publish })}
              />
              <TextField
                label={t.fieldPublishedAt}
                type="datetime-local"
                value={form.publishedAt}
                onChange={(event) => update({ publishedAt: event.target.value })}
                dir="ltr"
              />
              <SelectField
                label={t.fieldCategory}
                value={form.blogCategoryId || NO_CATEGORY}
                onValueChange={(value) =>
                  update({ blogCategoryId: value === NO_CATEGORY ? "" : value })
                }
                options={[{ value: NO_CATEGORY, label: t.noCategory }, ...categoryOptions]}
              />
              <TextField
                label={t.slug}
                value={form.slug}
                onChange={(event) => update({ slug: event.target.value })}
                helperText={t.slugHelper}
                maxLength={140}
                dir="ltr"
              />
            </CrudFormSection>

            <CrudFormSection title={t.sectionImage}>
              <ImageField
                label={t.image}
                currentUrl={post?.imageFileUrl}
                value={form.image}
                onChange={(image) => update({ image })}
              />
            </CrudFormSection>

            <CrudFormSection title={t.sectionSeo}>
              <LocaleFieldsTabs
                fields={seoFields}
                value={form.translations}
                onChange={(translations) => update({ translations })}
              />
            </CrudFormSection>
          </>
        }
      />

      <CrudFormFooter
        submitLabel={mode === "create" ? t.addBlogPost : t.save}
        cancelLabel={t.cancel}
        onCancel={onCancel}
        isLoading={isLoading}
        loadingLabel={t.loadingMessage}
      />
    </CrudFormShell>
  );
}
