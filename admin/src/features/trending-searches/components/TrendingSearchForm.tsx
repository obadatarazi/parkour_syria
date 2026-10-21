import { type ReactNode, useEffect, useState } from "react";

import { TrendingSearchTargetPicker } from "@/features/trending-searches/components/TrendingSearchTargetPicker";
import type {
  TrendingSearch,
  TrendingSearchFormData,
  TrendingSearchTargetTypeValue,
} from "@/features/trending-searches/types/trending-searches.types";
import {
  createEmptyTrendingSearchForm,
  trendingSearchToFormData,
} from "@/features/trending-searches/types/trending-searches.types";
import { SelectField, TextField, ToggleField } from "@/shared/components";
import { TitleTranslationFields } from "@/shared/components/forms/TitleTranslationFields";
import { CrudFormFooter, CrudFormShell } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { useTrendingSearchTargetTypeOptions } from "@/shared/hooks/use-options";

type TrendingSearchFormProps = {
  mode: "create" | "edit";
  item?: TrendingSearch | null;
  isLoading?: boolean;
  onSubmit: (data: TrendingSearchFormData) => void | Promise<void>;
  onCancel: () => void;
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
    <section
      className="space-y-4 rounded-xl border border-border bg-muted/15 p-4"
      data-guidance={dataGuidance}
    >
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function TrendingSearchForm({
  mode,
  item,
  isLoading = false,
  onSubmit,
  onCancel,
  onDirtyChange,
}: TrendingSearchFormProps) {
  const t = useTranslation();
  const { options: targetTypeOptions } = useTrendingSearchTargetTypeOptions();
  const [form, setForm] = useState<TrendingSearchFormData>(createEmptyTrendingSearchForm());
  const [titleErrors, setTitleErrors] = useState<Partial<Record<"en" | "ar", string>>>({});
  const [targetTypeError, setTargetTypeError] = useState<string>();
  const [targetIdError, setTargetIdError] = useState<string>();
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setForm(item ? trendingSearchToFormData(item) : createEmptyTrendingSearchForm());
    setTitleErrors({});
    setTargetTypeError(undefined);
    setTargetIdError(undefined);
    setIsDirty(false);
  }, [item, mode]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const updateForm = (updater: (current: TrendingSearchFormData) => TrendingSearchFormData) => {
    setForm(updater);
    setIsDirty(true);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextTitleErrors: Partial<Record<"en" | "ar", string>> = {};
    let nextTargetTypeError: string | undefined;
    let nextTargetIdError: string | undefined;

    if (!form.translations.en?.title?.trim() && !form.translations.ar?.title?.trim()) {
      nextTitleErrors.en = t.required;
    }
    if (!form.targetType) {
      nextTargetTypeError = t.trendingSearchTargetTypeRequired;
    } else if (form.targetType !== "KEYWORD" && form.targetId == null) {
      nextTargetIdError = t.trendingSearchTargetRequired;
    }

    setTitleErrors(nextTitleErrors);
    setTargetTypeError(nextTargetTypeError);
    setTargetIdError(nextTargetIdError);

    if (Object.keys(nextTitleErrors).length > 0 || nextTargetTypeError || nextTargetIdError) {
      return;
    }

    void onSubmit(form);
  };

  return (
    <CrudFormShell onSubmit={handleSubmit} className="space-y-4">
      <FormSection title={t.trendingSearchContent} description={t.trendingSearchContentHint}>
        <TitleTranslationFields
          value={form.translations}
          onChange={(translations) => updateForm((current) => ({ ...current, translations }))}
          titleErrors={titleErrors}
          titleLabelEn={t.trendingSearchLabelEnglish}
          titleLabelAr={t.trendingSearchLabelArabic}
          layout="tabs"
          autoFocusFirstField
        />
      </FormSection>

      <FormSection title={t.trendingSearchTarget} description={t.trendingSearchTargetHint}>
        <SelectField
          label={t.trendingSearchTargetType}
          value={form.targetType}
          onValueChange={(value) => {
            setTargetTypeError(undefined);
            setTargetIdError(undefined);
            updateForm((current) => ({
              ...current,
              targetType: (value as TrendingSearchTargetTypeValue) || "",
              targetId: null,
            }));
          }}
          options={targetTypeOptions}
          placeholder={t.trendingSearchSelectTargetType}
          required
          error={targetTypeError}
          disabled={isLoading}
        />
        <TrendingSearchTargetPicker
          targetType={form.targetType}
          value={form.targetId}
          disabled={isLoading}
          error={targetIdError}
          onChange={(targetId) => {
            setTargetIdError(undefined);
            updateForm((current) => ({ ...current, targetId }));
          }}
        />
      </FormSection>

      <FormSection title={t.trendingSearchVisibility} dataGuidance="crud-form-visibility">
        <ToggleField
          label={t.publish}
          checked={form.publish}
          onCheckedChange={(checked) => updateForm((current) => ({ ...current, publish: checked }))}
        />
        <TextField
          label={t.trendingSearchSortOrder}
          type="number"
          value={String(form.sortOrder)}
          onChange={(event) =>
            updateForm((current) => ({
              ...current,
              sortOrder: Number(event.target.value) || 0,
            }))
          }
          helperText={t.trendingSearchSortOrderHint}
          disabled={isLoading}
        />
      </FormSection>

      <CrudFormFooter
        submitLabel={mode === "create" ? t.addTrendingSearch : t.save}
        cancelLabel={t.cancel}
        onCancel={onCancel}
        isLoading={isLoading}
        loadingLabel={t.loadingMessage}
      />
    </CrudFormShell>
  );
}
