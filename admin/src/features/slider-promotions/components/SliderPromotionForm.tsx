import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import type {
  SliderPromotion,
  SliderPromotionFormData,
  SliderPromotionImageFormItem,
} from "@/features/slider-promotions/types/slider-promotions.types";
import {
  createEmptyImageItem,
  createEmptySliderPromotionForm,
  sliderPromotionToFormData,
} from "@/features/slider-promotions/types/slider-promotions.types";
import { AppButton, SelectField, TextField, ToggleField } from "@/shared/components";
import { LocaleImageUploadFields } from "@/shared/components/forms/LocaleImageUploadFields";
import { CrudFormFooter, CrudFormShell } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { useSliderPromotionTypeOptions } from "@/shared/hooks/use-options";

type SliderPromotionFormProps = {
  mode: "create" | "edit";
  promotion?: SliderPromotion | null;
  isLoading?: boolean;
  onSubmit: (data: SliderPromotionFormData) => void | Promise<void>;
  onCancel: () => void;
};

export function SliderPromotionForm({
  mode,
  promotion,
  isLoading = false,
  onSubmit,
  onCancel,
}: SliderPromotionFormProps) {
  const t = useTranslation();
  const { options: typeOptions, isLoading: isTypeOptionsLoading } = useSliderPromotionTypeOptions();
  const [form, setForm] = useState<SliderPromotionFormData>(createEmptySliderPromotionForm());
  const [imagesError, setImagesError] = useState<string | undefined>();

  useEffect(() => {
    setForm(promotion ? sliderPromotionToFormData(promotion) : createEmptySliderPromotionForm());
    setImagesError(undefined);
  }, [promotion, mode]);

  const updateImage = (index: number, image: SliderPromotionImageFormItem) => {
    setForm((current) => ({
      ...current,
      images: current.images.map((entry, entryIndex) => (entryIndex === index ? image : entry)),
    }));
  };

  const addImage = () => {
    setForm((current) => ({
      ...current,
      images: [...current.images, createEmptyImageItem()],
    }));
  };

  const removeImage = (index: number) => {
    setForm((current) => {
      const target = current.images[index];
      const deletedImageIds =
        target?.id && !current.deletedImageIds.includes(target.id)
          ? [...current.deletedImageIds, target.id]
          : current.deletedImageIds;

      const images = current.images.filter((_, entryIndex) => entryIndex !== index);
      return {
        ...current,
        images: images.length ? images : [createEmptyImageItem()],
        deletedImageIds,
      };
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (mode === "create") {
      const hasValidImage = form.images.some((image) => {
        const enReady = image.translations.en?.file instanceof File;
        const arReady = image.translations.ar?.file instanceof File;
        return enReady || arReady;
      });
      if (!hasValidImage) {
        setImagesError(t.promotionImagesRequired);
        return;
      }
    }

    setImagesError(undefined);
    void onSubmit(form);
  };

  return (
    <CrudFormShell onSubmit={handleSubmit}>
      <SelectField
        label={t.promotionType}
        value={form.type}
        onValueChange={(value) =>
          setForm((current) => ({ ...current, type: value as SliderPromotionFormData["type"] }))
        }
        options={typeOptions}
        required
        disabled={isTypeOptionsLoading}
      />

      <TextField
        label={t.position}
        type="number"
        min={0}
        value={String(form.position)}
        onChange={(event) =>
          setForm((current) => ({ ...current, position: Number(event.target.value) || 0 }))
        }
        required
      />

      <TextField
        label={t.link}
        value={form.link ?? ""}
        onChange={(event) => setForm((current) => ({ ...current, link: event.target.value }))}
      />

      <ToggleField
        label={t.publish}
        checked={form.publish ?? true}
        onCheckedChange={(checked) => setForm((current) => ({ ...current, publish: checked }))}
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-foreground">{t.promotionImages}</p>
          <AppButton type="button" variant="outline" size="sm" onClick={addImage}>
            <Plus className="size-4" aria-hidden="true" />
            {t.addImage}
          </AppButton>
        </div>
        {imagesError ? <p className="text-sm text-destructive">{imagesError}</p> : null}

        {form.images.map((image, index) => (
          <div
            key={image.id ?? `new-${index}`}
            className="space-y-3 rounded-xl border border-border p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-foreground">
                {t.promotionImage} {index + 1}
              </p>
              {form.images.length > 1 ? (
                <AppButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeImage(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  {t.removeImage}
                </AppButton>
              ) : null}
            </div>
            <LocaleImageUploadFields
              value={image.translations}
              onChange={(translations) => updateImage(index, { ...image, translations })}
              layout="tabs"
            />
          </div>
        ))}
      </div>

      <CrudFormFooter
        submitLabel={mode === "create" ? t.addSliderPromotion : t.save}
        cancelLabel={t.cancel}
        onCancel={onCancel}
        isLoading={isLoading}
        loadingLabel={t.loadingMessage}
      />
    </CrudFormShell>
  );
}
