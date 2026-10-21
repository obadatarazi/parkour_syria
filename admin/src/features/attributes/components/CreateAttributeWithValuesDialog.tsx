import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { attributesService } from "@/features/attributes/services/attributes.service";
import type { Attribute } from "@/features/attributes/types/attributes.types";
import { createEmptyAttributeForm } from "@/features/attributes/types/attributes.types";
import { attributeValuesService } from "@/features/attribute-values/services/attribute-values.service";
import type { AttributeValue } from "@/features/attribute-values/types/attribute-values.types";
import { AppButton, AppDialog, ToggleField } from "@/shared/components";
import { TitleTranslationFields } from "@/shared/components/forms/TitleTranslationFields";
import { invalidateQueryCache, useCrudMutation } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import type { TranslationsInput } from "@/shared/lib/api/form-data.utils";

type ValueDraft = {
  key: string;
  translations: TranslationsInput;
};

type CreateAttributeWithValuesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (attribute: Attribute, values: AttributeValue[]) => void | Promise<void>;
};

function createEmptyTranslations(): TranslationsInput {
  return {
    en: { title: "" },
    ar: { title: "" },
  };
}

function createEmptyValueDraft(): ValueDraft {
  return {
    key: crypto.randomUUID(),
    translations: createEmptyTranslations(),
  };
}

function hasTitle(translations: TranslationsInput): boolean {
  return Boolean(translations.en?.title?.trim() || translations.ar?.title?.trim());
}

export function CreateAttributeWithValuesDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateAttributeWithValuesDialogProps) {
  const t = useTranslation();
  const [attributeTranslations, setAttributeTranslations] =
    useState<TranslationsInput>(createEmptyTranslations());
  const [publish, setPublish] = useState(true);
  const [values, setValues] = useState<ValueDraft[]>([createEmptyValueDraft()]);
  const [attributeTitleError, setAttributeTitleError] = useState<string | undefined>();
  const [valuesError, setValuesError] = useState<string | undefined>();

  const createMutation = useCrudMutation({
    mutationFn: async (payload: {
      translations: TranslationsInput;
      publish: boolean;
      values: TranslationsInput[];
    }) => {
      const attribute = await attributesService.create({
        translations: payload.translations,
        publish: payload.publish,
      });

      const createdValues: AttributeValue[] = [];
      for (const translations of payload.values) {
        const value = await attributeValuesService.create({
          attributeId: attribute.id,
          translations,
          publish: true,
        });
        createdValues.push(value);
      }

      return { attribute, values: createdValues };
    },
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.attributeCreatedWithValuesSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
  });

  const { reset, isPending } = createMutation;

  useEffect(() => {
    if (!open) return;
    const empty = createEmptyAttributeForm();
    setAttributeTranslations(empty.translations);
    setPublish(empty.publish ?? true);
    setValues([createEmptyValueDraft()]);
    setAttributeTitleError(undefined);
    setValuesError(undefined);
    reset();
  }, [open, reset]);

  const updateValueTranslations = (key: string, translations: TranslationsInput) => {
    setValues((current) =>
      current.map((entry) => (entry.key === key ? { ...entry, translations } : entry)),
    );
  };

  const removeValue = (key: string) => {
    setValues((current) =>
      current.length <= 1 ? current : current.filter((entry) => entry.key !== key),
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const nextAttributeError = hasTitle(attributeTranslations) ? undefined : t.required;
    const filledValues = values.filter((entry) => hasTitle(entry.translations));
    const nextValuesError = filledValues.length === 0 ? t.attributeValuesRequired : undefined;

    setAttributeTitleError(nextAttributeError);
    setValuesError(nextValuesError);
    if (nextAttributeError || nextValuesError) return;

    const result = await createMutation.mutate({
      translations: attributeTranslations,
      publish,
      values: filledValues.map((entry) => entry.translations),
    });

    if (!result.ok) return;

    // Keep product drawer open — only refresh attribute catalog caches, not the page.
    invalidateQueryCache("attributes");
    await onCreated(result.data.attribute, result.data.values);
    onOpenChange(false);
  };

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t.addAttribute}
      description={t.createAttributeWithValuesDescription}
      size="lg"
      isLoading={isPending}
    >
      <form
        id="create-attribute-with-values-form"
        onSubmit={(event) => void handleSubmit(event)}
        className="space-y-5"
      >
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">{t.attributeContent}</h3>
          <TitleTranslationFields
            value={attributeTranslations}
            onChange={setAttributeTranslations}
            titleErrors={attributeTitleError ? { en: attributeTitleError } : undefined}
            layout="tabs"
            autoFocusFirstField
          />
          <ToggleField label={t.publish} checked={publish} onCheckedChange={setPublish} />
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-foreground">{t.attributeValues}</h3>
            <AppButton
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => setValues((current) => [...current, createEmptyValueDraft()])}
            >
              <Plus className="size-4" aria-hidden="true" />
              {t.addAttributeValue}
            </AppButton>
          </div>

          {valuesError ? <p className="text-xs text-destructive">{valuesError}</p> : null}

          <div className="space-y-3">
            {values.map((entry, index) => (
              <div
                key={entry.key}
                className="space-y-3 rounded-xl border border-border/70 bg-muted/10 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    {t.attributeValueOptionNumber.replace("{n}", String(index + 1))}
                  </p>
                  {values.length > 1 ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-xs font-medium text-destructive hover:underline"
                      disabled={isPending}
                      onClick={() => removeValue(entry.key)}
                    >
                      <Trash2 className="size-3.5" aria-hidden="true" />
                      {t.remove}
                    </button>
                  ) : null}
                </div>
                <TitleTranslationFields
                  value={entry.translations}
                  onChange={(translations) => updateValueTranslations(entry.key, translations)}
                  layout="stacked"
                />
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <AppButton
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            {t.cancel}
          </AppButton>
          <AppButton type="submit" isLoading={isPending} loadingText={t.loadingMessage}>
            {t.addAttribute}
          </AppButton>
        </div>
      </form>
    </AppDialog>
  );
}
