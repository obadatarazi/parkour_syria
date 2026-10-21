import { useState } from "react";

import { useAreaOptions } from "@/features/areas/hooks/use-areas-list";
import {
  createEmptyDirectoryEntryForm,
  type DirectoryEntry,
  type DirectoryEntryFormData,
  type DirectoryEntryLocaleField,
  directoryEntryToFormData,
  type DirectoryEntryType,
} from "@/features/directory-entries/types/directory-entries.types";
import { directoryEntryTypeOptions } from "@/features/directory-entries/utils/directory-entry-labels";
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

type DirectoryEntryFormProps = {
  mode: "create" | "edit";
  entry?: DirectoryEntry | null;
  isLoading?: boolean;
  onSubmit: (data: DirectoryEntryFormData) => void | Promise<void>;
  onCancel: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
};

const NO_AREA = "none";

const buildForm = (entry?: DirectoryEntry | null) =>
  entry ? directoryEntryToFormData(entry) : createEmptyDirectoryEntryForm();

export function DirectoryEntryForm({
  mode,
  entry,
  isLoading,
  onSubmit,
  onCancel,
  onDirtyChange,
}: DirectoryEntryFormProps) {
  const t = useTranslation();
  const { form, update } = useCrudFormState(entry, buildForm, mode, onDirtyChange);
  const [errors, setErrors] = useState<LocaleFieldErrors<DirectoryEntryLocaleField>>({});
  const { options: areaOptions } = useAreaOptions();

  const fields: LocaleFieldDefinition<DirectoryEntryLocaleField>[] = [
    { key: "name", label: t.fieldName, required: true, maxLength: 255 },
    { key: "description", label: t.fieldDescription, richText: true, rows: 6 },
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
        <SelectField
          label={t.directoryType}
          value={form.type}
          onValueChange={(type) => update({ type: type as DirectoryEntryType })}
          options={directoryEntryTypeOptions(t)}
          required
        />
        <LocaleFieldsTabs
          fields={fields}
          value={form.translations}
          onChange={(translations) => update({ translations })}
          errors={errors}
        />
      </CrudFormSection>

      <CrudFormSection title={t.sectionImage}>
        <ImageField
          label={t.image}
          currentUrl={entry?.imageFileUrl}
          value={form.image}
          onChange={(image) => update({ image })}
        />
      </CrudFormSection>

      <CrudFormSection title={t.sectionContact}>
        <SelectField
          label={t.fieldArea}
          value={form.areaId || NO_AREA}
          onValueChange={(value) => update({ areaId: value === NO_AREA ? "" : value })}
          options={[{ value: NO_AREA, label: t.noArea }, ...areaOptions]}
        />
        <TextField
          label={t.fieldWhatsapp}
          type="tel"
          value={form.whatsapp}
          onChange={(event) => update({ whatsapp: event.target.value })}
          maxLength={30}
          placeholder="+963…"
        />
        <TextField
          label={t.fieldFacebookUrl}
          type="url"
          value={form.facebookUrl}
          onChange={(event) => update({ facebookUrl: event.target.value })}
          dir="ltr"
        />
        <TextField
          label={t.fieldInstagramUrl}
          type="url"
          value={form.instagramUrl}
          onChange={(event) => update({ instagramUrl: event.target.value })}
          dir="ltr"
        />
        <TextField
          label={t.fieldMapUrl}
          type="url"
          value={form.mapUrl}
          onChange={(event) => update({ mapUrl: event.target.value })}
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
          label={t.fieldVerified}
          checked={form.verified}
          onCheckedChange={(verified) => update({ verified })}
        />
        <ToggleField
          label={t.publish}
          checked={form.publish}
          onCheckedChange={(publish) => update({ publish })}
        />
      </CrudFormSection>

      <CrudFormFooter
        submitLabel={mode === "create" ? t.addDirectoryEntry : t.save}
        cancelLabel={t.cancel}
        onCancel={onCancel}
        isLoading={isLoading}
        loadingLabel={t.loadingMessage}
      />
    </CrudFormShell>
  );
}
