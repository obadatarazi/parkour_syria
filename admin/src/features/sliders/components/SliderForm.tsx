import { useState } from "react";

import {
  createEmptySliderForm,
  SITE_PATH_KEYS,
  sitePathLabel,
  type Slider,
  type SliderFormData,
  type SliderLocaleField,
  sliderToFormData,
} from "@/features/sliders/types/sliders.types";
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
import { CrudFormFooter, CrudFormSection, CrudFormShell, useCrudFormState } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type SliderFormProps = {
  mode: "create" | "edit";
  slider?: Slider | null;
  isLoading?: boolean;
  onSubmit: (data: SliderFormData) => void | Promise<void>;
  onCancel: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
};

const NO_PAGE = "none";

const buildForm = (slider?: Slider | null) =>
  slider ? sliderToFormData(slider) : createEmptySliderForm();

export function SliderForm({
  mode,
  slider,
  isLoading,
  onSubmit,
  onCancel,
  onDirtyChange,
}: SliderFormProps) {
  const t = useTranslation();
  const { form, update } = useCrudFormState(slider, buildForm, mode, onDirtyChange);
  const [errors, setErrors] = useState<LocaleFieldErrors<SliderLocaleField>>({});

  const fields: LocaleFieldDefinition<SliderLocaleField>[] = [
    { key: "badge", label: t.fieldBadge, maxLength: 255 },
    { key: "title", label: t.fieldTitle, required: true, maxLength: 255 },
    { key: "description", label: t.fieldDescription, multiline: true, rows: 3 },
    { key: "primary_button_text", label: t.fieldPrimaryButtonText, maxLength: 255 },
    { key: "secondary_button_text", label: t.fieldSecondaryButtonText, maxLength: 255 },
  ];
  const pageOptions = [
    { value: NO_PAGE, label: t.noLinkedPage },
    ...SITE_PATH_KEYS.map((key) => ({ value: key, label: sitePathLabel(t, key) })),
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
          currentUrl={slider?.imageFileUrl}
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
        <SelectField
          label={t.fieldPrimaryPage}
          value={form.primaryPage || NO_PAGE}
          onValueChange={(value) => update({ primaryPage: value === NO_PAGE ? "" : value })}
          options={pageOptions}
        />
        <SelectField
          label={t.fieldSecondaryPage}
          value={form.secondaryPage || NO_PAGE}
          onValueChange={(value) => update({ secondaryPage: value === NO_PAGE ? "" : value })}
          options={pageOptions}
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
        submitLabel={mode === "create" ? t.addSlide : t.save}
        cancelLabel={t.cancel}
        onCancel={onCancel}
        isLoading={isLoading}
        loadingLabel={t.loadingMessage}
      />
    </CrudFormShell>
  );
}
