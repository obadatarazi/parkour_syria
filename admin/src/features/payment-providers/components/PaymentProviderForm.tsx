import { type ReactNode, useEffect, useState } from "react";

import type {
  PaymentProvider,
  PaymentProviderFormData,
  PaymentProviderTypeValue,
} from "@/features/payment-providers/types/payment-providers.types";
import {
  createEmptyPaymentProviderForm,
  paymentProviderToFormData,
} from "@/features/payment-providers/types/payment-providers.types";
import { MediaImage, SelectField, ToggleField } from "@/shared/components";
import { TranslationFields } from "@/shared/components/forms/TranslationFields";
import { CrudFileUpload, CrudFormFooter, CrudFormShell } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { useInvoicePaymentProviderOptions } from "@/shared/hooks/use-options";
import type { FieldErrors } from "@/shared/types";

type PaymentProviderFormProps = {
  mode: "create" | "edit";
  paymentProvider?: PaymentProvider | null;
  isLoading?: boolean;
  onSubmit: (data: PaymentProviderFormData) => void | Promise<void>;
  onCancel: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
};

type PaymentProviderFormErrors = FieldErrors<"type">;

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

export function PaymentProviderForm({
  mode,
  paymentProvider,
  isLoading = false,
  onSubmit,
  onCancel,
  onDirtyChange,
}: PaymentProviderFormProps) {
  const t = useTranslation();
  const { options: typeOptions, isLoading: isTypeOptionsLoading } =
    useInvoicePaymentProviderOptions();
  const [form, setForm] = useState<PaymentProviderFormData>(createEmptyPaymentProviderForm());
  const [titleErrors, setTitleErrors] = useState<Partial<Record<"en" | "ar", string>>>({});
  const [errors, setErrors] = useState<PaymentProviderFormErrors>({});
  const [isDirty, setIsDirty] = useState(false);

  const isEditingStandard = mode === "edit" && Boolean(paymentProvider?.standard);

  useEffect(() => {
    setForm(
      paymentProvider
        ? paymentProviderToFormData(paymentProvider)
        : createEmptyPaymentProviderForm(),
    );
    setTitleErrors({});
    setErrors({});
    setIsDirty(false);
  }, [paymentProvider, mode]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const updateForm = (updater: (current: PaymentProviderFormData) => PaymentProviderFormData) => {
    setForm(updater);
    setIsDirty(true);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextTitleErrors: Partial<Record<"en" | "ar", string>> = {};
    const nextErrors: PaymentProviderFormErrors = {};

    if (!form.translations.en?.title?.trim() && !form.translations.ar?.title?.trim()) {
      nextTitleErrors.en = t.required;
    }
    if (!form.type) nextErrors.type = t.required;

    setTitleErrors(nextTitleErrors);
    setErrors(nextErrors);
    if (Object.keys(nextTitleErrors).length > 0 || Object.keys(nextErrors).length > 0) return;
    void onSubmit(form);
  };

  return (
    <CrudFormShell onSubmit={handleSubmit} className="space-y-4">
      <FormSection title={t.paymentProviderContent}>
        <TranslationFields
          value={form.translations}
          onChange={(translations) => updateForm((current) => ({ ...current, translations }))}
          titleErrors={titleErrors}
          layout="tabs"
          autoFocusFirstField
        />
      </FormSection>

      <FormSection title={t.paymentProviderMedia}>
        {paymentProvider?.imageFileUrl && !form.image ? (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">{t.currentImage}</p>
            <div className="overflow-hidden rounded-lg border border-border">
              <MediaImage
                src={paymentProvider.imageFileUrl}
                alt=""
                className="max-h-44 w-full object-cover"
              />
            </div>
          </div>
        ) : null}

        <CrudFileUpload
          label={t.paymentProviderImage}
          accept="image/*"
          helperText={paymentProvider?.imageFileUrl ? t.replaceImageHint : undefined}
          value={form.image ?? null}
          onFileSelect={(file) => updateForm((current) => ({ ...current, image: file }))}
        />
      </FormSection>

      <FormSection title={t.paymentProviderDetails}>
        <SelectField
          label={t.paymentProviderType}
          value={form.type}
          options={typeOptions}
          onValueChange={(value) => {
            updateForm((current) => ({
              ...current,
              type: value as PaymentProviderTypeValue,
            }));
            if (errors.type) setErrors((current) => ({ ...current, type: undefined }));
          }}
          error={errors.type}
          required
          disabled={isTypeOptionsLoading}
        />
        <ToggleField
          label={t.publish}
          checked={form.publish ?? true}
          onCheckedChange={(checked) => updateForm((current) => ({ ...current, publish: checked }))}
        />
        <ToggleField
          label={t.standardPaymentProvider}
          checked={form.standard ?? false}
          disabled={isEditingStandard}
          description={
            isEditingStandard ? t.standardPaymentProviderCannotUnset : undefined
          }
          onCheckedChange={(checked) =>
            updateForm((current) => ({ ...current, standard: checked }))
          }
        />
      </FormSection>

      <CrudFormFooter
        submitLabel={mode === "create" ? t.addPaymentProvider : t.save}
        cancelLabel={t.cancel}
        onCancel={onCancel}
        isLoading={isLoading}
        loadingLabel={t.loadingMessage}
      />
    </CrudFormShell>
  );
}
