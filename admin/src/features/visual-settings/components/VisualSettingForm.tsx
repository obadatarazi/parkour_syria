import { useEffect, useState } from "react";

import type {
  VisualSetting,
  VisualSettingFormData,
} from "@/features/visual-settings/types/visual-settings.types";
import {
  createEmptyVisualSettingForm,
  visualSettingToFormData,
} from "@/features/visual-settings/types/visual-settings.types";
import { MediaImage, TextField, TranslationFields } from "@/shared/components";
import { CrudFileUpload, CrudFormFooter, CrudFormShell } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type VisualSettingFormProps = {
  setting?: VisualSetting | null;
  isLoading?: boolean;
  onSubmit: (data: VisualSettingFormData) => void | Promise<void>;
  onCancel: () => void;
};

export function VisualSettingForm({
  setting,
  isLoading = false,
  onSubmit,
  onCancel,
}: VisualSettingFormProps) {
  const t = useTranslation();
  const [form, setForm] = useState<VisualSettingFormData>(createEmptyVisualSettingForm());

  useEffect(() => {
    setForm(setting ? visualSettingToFormData(setting) : createEmptyVisualSettingForm());
  }, [setting]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void onSubmit(form);
  };

  return (
    <CrudFormShell onSubmit={handleSubmit}>
      <TranslationFields
        value={form.translations}
        onChange={(translations) => setForm((current) => ({ ...current, translations }))}
        layout="tabs"
        autoFocusFirstField
      />

      <TextField
        label={t.link}
        value={form.link ?? ""}
        onChange={(event) => setForm((current) => ({ ...current, link: event.target.value }))}
        type="url"
      />

      <CrudFileUpload
        label={t.featureImage}
        accept="image/*"
        value={form.image ?? null}
        onFileSelect={(file) => setForm((current) => ({ ...current, image: file }))}
      />
      {setting?.imageFileUrl && !form.image ? (
        <div className="overflow-hidden rounded-lg border border-border">
          <MediaImage
            src={setting.imageFileUrl}
            alt=""
            className="max-h-40 w-full object-contain"
          />
          <p className="border-t border-border/60 px-3 py-2 text-xs text-muted-foreground">
            {t.replaceImageHint}
          </p>
        </div>
      ) : null}

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
