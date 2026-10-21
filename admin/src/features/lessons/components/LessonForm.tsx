import { useState } from "react";

import {
  createEmptyLessonForm,
  type Lesson,
  type LessonFormData,
  type LessonLocaleField,
  lessonToFormData,
} from "@/features/lessons/types/lessons.types";
import {
  hasLocaleFieldErrors,
  ImageField,
  type LocaleFieldDefinition,
  type LocaleFieldErrors,
  LocaleFieldsTabs,
  TextField,
  ToggleField,
  validateLocaleFields,
} from "@/shared/components";
import { CrudFormFooter, CrudFormSection, CrudFormShell, useCrudFormState } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type LessonFormProps = {
  mode: "create" | "edit";
  lesson?: Lesson | null;
  isLoading?: boolean;
  onSubmit: (data: LessonFormData) => void | Promise<void>;
  onCancel: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
};

const buildForm = (lesson?: Lesson | null) =>
  lesson ? lessonToFormData(lesson) : createEmptyLessonForm();

export function LessonForm({
  mode,
  lesson,
  isLoading,
  onSubmit,
  onCancel,
  onDirtyChange,
}: LessonFormProps) {
  const t = useTranslation();
  const { form, update } = useCrudFormState(lesson, buildForm, mode, onDirtyChange);
  const [errors, setErrors] = useState<LocaleFieldErrors<LessonLocaleField>>({});

  const fields: LocaleFieldDefinition<LessonLocaleField>[] = [
    { key: "title", label: t.fieldTitle, required: true, maxLength: 255 },
    { key: "summary", label: t.fieldSummary, multiline: true, rows: 2, maxLength: 500 },
    { key: "body", label: t.fieldBody, multiline: true, rows: 8 },
    { key: "safety_note", label: t.fieldSafetyNote, multiline: true, rows: 3 },
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

      <CrudFormSection title={t.sectionImage}>
        <ImageField
          label={t.image}
          currentUrl={lesson?.imageFileUrl}
          value={form.image}
          onChange={(image) => update({ image })}
        />
        <TextField
          label={t.fieldYoutubeUrl}
          type="url"
          value={form.youtubeUrl}
          onChange={(event) => update({ youtubeUrl: event.target.value })}
          placeholder="https://www.youtube.com/watch?v=…"
          dir="ltr"
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
        submitLabel={mode === "create" ? t.addLesson : t.save}
        cancelLabel={t.cancel}
        onCancel={onCancel}
        isLoading={isLoading}
        loadingLabel={t.loadingMessage}
      />
    </CrudFormShell>
  );
}
