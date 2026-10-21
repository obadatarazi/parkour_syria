import { useState } from "react";

import {
  createEmptyGalleryImageForm,
  type GalleryImage,
  type GalleryImageFormData,
  type GalleryImageLocaleField,
  galleryImageToFormData,
} from "@/features/gallery-images/types/gallery-images.types";
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

type GalleryImageFormProps = {
  mode: "create" | "edit";
  galleryImage?: GalleryImage | null;
  isLoading?: boolean;
  onSubmit: (data: GalleryImageFormData) => void | Promise<void>;
  onCancel: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
};

const buildForm = (galleryImage?: GalleryImage | null) =>
  galleryImage ? galleryImageToFormData(galleryImage) : createEmptyGalleryImageForm();

export function GalleryImageForm({
  mode,
  galleryImage,
  isLoading,
  onSubmit,
  onCancel,
  onDirtyChange,
}: GalleryImageFormProps) {
  const t = useTranslation();
  const { form, update } = useCrudFormState(galleryImage, buildForm, mode, onDirtyChange);
  const [errors, setErrors] = useState<LocaleFieldErrors<GalleryImageLocaleField>>({});

  const fields: LocaleFieldDefinition<GalleryImageLocaleField>[] = [
    { key: "caption", label: t.fieldCaption, required: true, maxLength: 255 },
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
      <CrudFormSection title={t.sectionImage}>
        <ImageField
          label={t.image}
          currentUrl={galleryImage?.imageFileUrl}
          value={form.image}
          onChange={(image) => update({ image })}
        />
      </CrudFormSection>

      <CrudFormSection title={t.sectionContent}>
        <LocaleFieldsTabs
          fields={fields}
          value={form.translations}
          onChange={(translations) => update({ translations })}
          errors={errors}
        />
      </CrudFormSection>

      <CrudFormSection title={t.sectionDetails}>
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
        submitLabel={mode === "create" ? t.addGalleryImage : t.save}
        cancelLabel={t.cancel}
        onCancel={onCancel}
        isLoading={isLoading}
        loadingLabel={t.loadingMessage}
      />
    </CrudFormShell>
  );
}
