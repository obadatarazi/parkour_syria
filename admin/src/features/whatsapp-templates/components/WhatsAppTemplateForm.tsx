import { type ReactNode, useEffect, useState } from "react";

import type {
  WhatsAppTemplate,
  WhatsAppTemplateFormData,
} from "@/features/whatsapp-templates/types/whatsapp-templates.types";
import { whatsAppTemplateToFormData } from "@/features/whatsapp-templates/types/whatsapp-templates.types";
import { TextAreaField, ToggleField } from "@/shared/components";
import { CrudFormFooter, CrudFormShell } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type WhatsAppTemplateFormProps = {
  entity: WhatsAppTemplate;
  canTurnOff: boolean;
  isLoading?: boolean;
  onSubmit: (data: WhatsAppTemplateFormData) => void | Promise<void>;
  onCancel: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
};

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-xl border border-border bg-muted/15 p-4">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function WhatsAppTemplateForm({
  entity,
  canTurnOff,
  isLoading = false,
  onSubmit,
  onCancel,
  onDirtyChange,
}: WhatsAppTemplateFormProps) {
  const t = useTranslation();
  const [form, setForm] = useState<WhatsAppTemplateFormData>(() => whatsAppTemplateToFormData(entity));
  const [noteError, setNoteError] = useState<string | undefined>();
  const [switchError, setSwitchError] = useState<string | undefined>();
  const [isDirty, setIsDirty] = useState(false);
  const switchLocked = !canTurnOff && form.isEnabled;

  useEffect(() => {
    setForm(whatsAppTemplateToFormData(entity));
    setNoteError(undefined);
    setSwitchError(undefined);
    setIsDirty(false);
  }, [entity]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const updateForm = (updater: (current: WhatsAppTemplateFormData) => WhatsAppTemplateFormData) => {
    setForm(updater);
    setIsDirty(true);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const note = form.note.trim();
    const nextNoteError = note.length > 255 ? t.whatsappTemplateNoteTooLong : undefined;
    const nextSwitchError = !form.isEnabled && !canTurnOff ? t.whatsappTemplateCriticalHint : undefined;
    setNoteError(nextNoteError);
    setSwitchError(nextSwitchError);
    if (nextNoteError || nextSwitchError) return;
    void onSubmit({ ...form, note });
  };

  return (
    <CrudFormShell onSubmit={handleSubmit} className="space-y-4">
      <FormSection title={t.whatsappTemplateDetails} description={entity.description}>
        <ToggleField
          label={t.whatsappTemplateSwitch}
          description={
            entity.isCritical ? t.whatsappTemplateCriticalHint : t.whatsappTemplateSwitchHint
          }
          checked={form.isEnabled}
          disabled={switchLocked || isLoading}
          error={switchError}
          onCheckedChange={(checked) => {
            if (!checked && !canTurnOff) {
              setSwitchError(t.whatsappTemplateCriticalHint);
              return;
            }
            setSwitchError(undefined);
            updateForm((current) => ({ ...current, isEnabled: checked }));
          }}
        />

        <TextAreaField
          label={t.whatsappTemplateNote}
          helperText={t.whatsappTemplateNoteHint}
          value={form.note}
          rows={3}
          maxLength={255}
          error={noteError}
          disabled={isLoading}
          onChange={(event) => {
            setNoteError(undefined);
            updateForm((current) => ({ ...current, note: event.target.value }));
          }}
        />
      </FormSection>

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
