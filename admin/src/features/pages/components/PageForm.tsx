import { useState } from "react";

import {
  type PageFormData,
  type PageLocaleField,
  pageToFormData,
  type SitePage,
} from "@/features/pages/types/pages.types";
import {
  hasLocaleFieldErrors,
  ImageField,
  type LocaleFieldDefinition,
  type LocaleFieldErrors,
  LocaleFieldsTabs,
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

type PageFormProps = {
  page: SitePage;
  isLoading?: boolean;
  onSubmit: (data: PageFormData) => void | Promise<void>;
  onCancel: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
};

const buildForm = (page?: SitePage | null) =>
  pageToFormData(page ?? { id: 0, key: "", publish: true });

export function PageForm({ page, isLoading, onSubmit, onCancel, onDirtyChange }: PageFormProps) {
  const t = useTranslation();
  const { form, update } = useCrudFormState(page, buildForm, page.id, onDirtyChange);
  const [errors, setErrors] = useState<LocaleFieldErrors<PageLocaleField>>({});

  const contentFields: LocaleFieldDefinition<PageLocaleField>[] = [
    { key: "title", label: t.fieldTitle, required: true, maxLength: 255 },
    { key: "body", label: t.fieldBody, richText: true, rows: 16 },
  ];
  const seoFields: LocaleFieldDefinition<PageLocaleField>[] = [
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
        void onSubmit(form);
      }}
    >
      {page.key === "book" ? (
        <p className="rounded-xl border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
          {t.bookPageDescription}
        </p>
      ) : null}

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
            </CrudFormSection>

            <CrudFormSection title={t.sectionImage}>
              <ImageField
                label={t.image}
                currentUrl={page.imageFileUrl}
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
        submitLabel={t.save}
        cancelLabel={t.cancel}
        onCancel={onCancel}
        isLoading={isLoading}
        loadingLabel={t.loadingMessage}
      />
    </CrudFormShell>
  );
}
