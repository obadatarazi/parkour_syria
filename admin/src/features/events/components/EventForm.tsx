import { useState } from "react";

import { useAreaOptions } from "@/features/areas/hooks/use-areas-list";
import {
  createEmptyEventForm,
  type EventFormData,
  type EventLocaleField,
  eventToFormData,
  type EventType,
  type ParkourEvent,
} from "@/features/events/types/events.types";
import { eventTypeOptions } from "@/features/events/utils/event-labels";
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

type EventFormProps = {
  mode: "create" | "edit";
  event?: ParkourEvent | null;
  isLoading?: boolean;
  onSubmit: (data: EventFormData) => void | Promise<void>;
  onCancel: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
};

const NO_AREA = "none";

const buildForm = (event?: ParkourEvent | null) =>
  event ? eventToFormData(event) : createEmptyEventForm();

export function EventForm({
  mode,
  event,
  isLoading,
  onSubmit,
  onCancel,
  onDirtyChange,
}: EventFormProps) {
  const t = useTranslation();
  const { form, update } = useCrudFormState(event, buildForm, mode, onDirtyChange);
  const [errors, setErrors] = useState<LocaleFieldErrors<EventLocaleField>>({});
  const [startsAtError, setStartsAtError] = useState<string>();
  const { options: areaOptions } = useAreaOptions();

  const fields: LocaleFieldDefinition<EventLocaleField>[] = [
    { key: "title", label: t.fieldTitle, required: true, maxLength: 255 },
    { key: "location_label", label: t.fieldLocationLabel, maxLength: 255 },
    { key: "description", label: t.fieldDescription, richText: true, rows: 6 },
  ];

  return (
    <CrudFormShell
      className="space-y-4"
      onSubmit={(submitEvent) => {
        submitEvent.preventDefault();
        const nextErrors = validateLocaleFields(form.translations, fields, t.required);
        const nextStartsAtError = form.startsAt ? undefined : t.required;
        setErrors(nextErrors);
        setStartsAtError(nextStartsAtError);
        if (hasLocaleFieldErrors(nextErrors) || nextStartsAtError) return;
        void onSubmit(form);
      }}
    >
      <CrudFormSection title={t.sectionContent}>
        <SelectField
          label={t.eventType}
          value={form.type}
          onValueChange={(type) => update({ type: type as EventType })}
          options={eventTypeOptions(t)}
          required
        />
        <TextField
          label={t.fieldStartsAt}
          type="datetime-local"
          value={form.startsAt}
          onChange={(changeEvent) => update({ startsAt: changeEvent.target.value })}
          error={startsAtError}
          required
          dir="ltr"
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
          currentUrl={event?.imageFileUrl}
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
          label={t.fieldContact}
          value={form.contact}
          onChange={(changeEvent) => update({ contact: changeEvent.target.value })}
          maxLength={255}
        />
      </CrudFormSection>

      <CrudFormSection title={t.sectionDetails}>
        <TextField
          label={t.slug}
          value={form.slug}
          onChange={(changeEvent) => update({ slug: changeEvent.target.value })}
          helperText={t.slugHelper}
          maxLength={140}
          dir="ltr"
        />
        <ToggleField
          label={t.publish}
          checked={form.publish}
          onCheckedChange={(publish) => update({ publish })}
        />
      </CrudFormSection>

      <CrudFormFooter
        submitLabel={mode === "create" ? t.addEvent : t.save}
        cancelLabel={t.cancel}
        onCancel={onCancel}
        isLoading={isLoading}
        loadingLabel={t.loadingMessage}
      />
    </CrudFormShell>
  );
}
