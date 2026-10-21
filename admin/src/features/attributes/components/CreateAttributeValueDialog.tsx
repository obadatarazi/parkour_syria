import { useEffect, useState } from "react";

import { attributeValuesService } from "@/features/attribute-values/services/attribute-values.service";
import type { AttributeValue } from "@/features/attribute-values/types/attribute-values.types";
import { createEmptyAttributeValueForm } from "@/features/attribute-values/types/attribute-values.types";
import { AppButton, AppDialog, ToggleField } from "@/shared/components";
import { TitleTranslationFields } from "@/shared/components/forms/TitleTranslationFields";
import { invalidateQueryCache, useCrudMutation } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import type { TranslationsInput } from "@/shared/lib/api/form-data.utils";

type CreateAttributeValueDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attributeId: number;
  attributeLabel: string;
  onCreated: (value: AttributeValue) => void | Promise<void>;
};

export function CreateAttributeValueDialog({
  open,
  onOpenChange,
  attributeId,
  attributeLabel,
  onCreated,
}: CreateAttributeValueDialogProps) {
  const t = useTranslation();
  const [translations, setTranslations] = useState<TranslationsInput>(
    createEmptyAttributeValueForm().translations,
  );
  const [publish, setPublish] = useState(true);
  const [titleError, setTitleError] = useState<string | undefined>();

  const createMutation = useCrudMutation({
    mutationFn: (payload: {
      attributeId: number;
      translations: TranslationsInput;
      publish: boolean;
    }) =>
      attributeValuesService.create({
        attributeId: payload.attributeId,
        translations: payload.translations,
        publish: payload.publish,
      }),
    feedback: {
      successMessage: t.successMessage,
      successDescription: t.crudCreateSuccess,
      errorMessage: t.errorMessage,
      loadingMessage: t.loadingMessage,
    },
  });

  const { reset, isPending } = createMutation;

  useEffect(() => {
    if (!open) return;
    const empty = createEmptyAttributeValueForm();
    setTranslations(empty.translations);
    setPublish(empty.publish ?? true);
    setTitleError(undefined);
    reset();
  }, [open, reset]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const hasTitle = Boolean(translations.en?.title?.trim() || translations.ar?.title?.trim());
    if (!hasTitle) {
      setTitleError(t.required);
      return;
    }

    const result = await createMutation.mutate({
      attributeId,
      translations,
      publish,
    });

    if (!result.ok) return;

    // Keep product drawer open — only refresh attribute catalog caches, not the page.
    invalidateQueryCache("attributes");
    await onCreated(result.data);
    onOpenChange(false);
  };

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t.addAttributeValue}
      description={t.createAttributeValueForAttributeDescription.replace(
        "{attribute}",
        attributeLabel,
      )}
      size="md"
      isLoading={isPending}
    >
      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
        <TitleTranslationFields
          value={translations}
          onChange={setTranslations}
          titleErrors={titleError ? { en: titleError } : undefined}
          layout="tabs"
          autoFocusFirstField
        />
        <ToggleField label={t.publish} checked={publish} onCheckedChange={setPublish} />

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
            {t.addAttributeValue}
          </AppButton>
        </div>
      </form>
    </AppDialog>
  );
}
