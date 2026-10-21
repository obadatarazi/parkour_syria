import { useState } from "react";

import { useAreaOptions } from "@/features/areas/hooks/use-areas-list";
import {
  type Suggestion,
  SUGGESTION_TYPES,
  type SuggestionFormData,
  suggestionToFormData,
  type SuggestionType,
  suggestionTypeLabel,
} from "@/features/suggestions/types/suggestions.types";
import { SelectField, TextAreaField, TextField } from "@/shared/components";
import { CrudFormFooter, CrudFormSection, CrudFormShell, useCrudFormState } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type SuggestionFormProps = {
  suggestion: Suggestion;
  isLoading?: boolean;
  onSubmit: (data: SuggestionFormData) => void | Promise<void>;
  onCancel: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
};

const NO_AREA = "none";

const buildForm = (suggestion?: Suggestion | null) =>
  suggestionToFormData(
    suggestion ?? { id: 0, type: "place", status: "pending", safetyAccepted: false },
  );

/** Correct a visitor's suggestion before accepting it. The texts are what the visitor typed. */
export function SuggestionForm({
  suggestion,
  isLoading,
  onSubmit,
  onCancel,
  onDirtyChange,
}: SuggestionFormProps) {
  const t = useTranslation();
  const { form, update } = useCrudFormState(suggestion, buildForm, suggestion.id, onDirtyChange);
  const [nameError, setNameError] = useState<string>();
  const { options: areaOptions } = useAreaOptions();

  return (
    <CrudFormShell
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const nextNameError = form.name.trim() ? undefined : t.required;
        setNameError(nextNameError);
        if (nextNameError) return;
        void onSubmit(form);
      }}
    >
      <CrudFormSection title={t.sectionContent}>
        <SelectField
          label={t.suggestionType}
          value={form.type}
          onValueChange={(type) => update({ type: type as SuggestionType })}
          options={SUGGESTION_TYPES.map((value) => ({ value, label: suggestionTypeLabel(t, value) }))}
          required
        />
        <TextField
          label={t.fieldName}
          value={form.name}
          onChange={(event) => update({ name: event.target.value })}
          error={nameError}
          maxLength={255}
          required
        />
        <TextAreaField
          label={t.fieldDescription}
          value={form.description}
          onChange={(event) => update({ description: event.target.value })}
          rows={5}
          maxLength={5000}
        />
        <SelectField
          label={t.fieldArea}
          value={form.areaId || NO_AREA}
          onValueChange={(value) => update({ areaId: value === NO_AREA ? "" : value })}
          options={[{ value: NO_AREA, label: t.noArea }, ...areaOptions]}
        />
        {form.type === "event" ? (
          <TextField
            label={t.fieldStartsAt}
            type="datetime-local"
            value={form.startsAt}
            onChange={(event) => update({ startsAt: event.target.value })}
            dir="ltr"
          />
        ) : null}
      </CrudFormSection>

      <CrudFormSection title={t.sectionContact}>
        <TextField
          label={t.fieldContact}
          value={form.contact}
          onChange={(event) => update({ contact: event.target.value })}
          maxLength={255}
        />
        <TextField
          label={t.suggestionProposer}
          value={form.proposerName}
          onChange={(event) => update({ proposerName: event.target.value })}
          maxLength={255}
        />
        <TextField
          label={t.suggestionProposerContact}
          value={form.proposerContact}
          onChange={(event) => update({ proposerContact: event.target.value })}
          maxLength={255}
        />
      </CrudFormSection>

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
