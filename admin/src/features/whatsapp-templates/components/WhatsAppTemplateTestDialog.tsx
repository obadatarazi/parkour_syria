import { useEffect, useState } from "react";

import { WhatsAppTemplateMessage } from "@/features/whatsapp-templates/components/WhatsAppTemplateMessage";
import { WhatsAppTemplateParameterFields } from "@/features/whatsapp-templates/components/WhatsAppTemplateParameterFields";
import { useWhatsAppTemplateMutations } from "@/features/whatsapp-templates/hooks/use-whatsapp-template-mutations";
import type {
  WhatsAppTemplate,
  WhatsAppTemplateTestResult,
} from "@/features/whatsapp-templates/types/whatsapp-templates.types";
import {
  compactWhatsAppParameters,
  isWhatsAppTestPhone,
} from "@/features/whatsapp-templates/utils/whatsapp-template-display";
import { AppButton, AppDialog, TextField } from "@/shared/components";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type WhatsAppTemplateTestDialogProps = {
  entity: WhatsAppTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function WhatsAppTemplateTestDialog({
  entity,
  open,
  onOpenChange,
}: WhatsAppTemplateTestDialogProps) {
  const t = useTranslation();
  const { sendTestMutation, isSendingTest } = useWhatsAppTemplateMutations();
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | undefined>();
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<WhatsAppTemplateTestResult | null>(null);

  useEffect(() => {
    if (!open) return;
    setPhone("");
    setPhoneError(undefined);
    setValues({});
    setResult(null);
  }, [open, entity?.event]);

  if (!entity) return null;

  const parameters = entity.preview.parameters;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isWhatsAppTestPhone(phone)) {
      setPhoneError(t.whatsappTemplatePhoneInvalid);
      return;
    }
    setPhoneError(undefined);
    const response = await sendTestMutation.mutate({
      event: entity.event,
      phone: phone.trim(),
      parameters: compactWhatsAppParameters(values),
    });
    if (response.ok && response.data) {
      setResult(response.data);
    }
  };

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t.whatsappTemplateSendTest}
      description={t.whatsappTemplateSendTestDescription}
      size="lg"
      isLoading={isSendingTest}
      footer={
        <>
          <AppButton variant="outline" onClick={() => onOpenChange(false)} disabled={isSendingTest}>
            {t.cancel}
          </AppButton>
          <AppButton type="submit" form="whatsapp-template-test" isLoading={isSendingTest} loadingText={t.loadingMessage}>
            {t.whatsappTemplateSendTest}
          </AppButton>
        </>
      }
    >
      <form id="whatsapp-template-test" className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
        <p className="text-sm text-muted-foreground">
          {entity.label}
          <span className="ms-2 font-mono text-xs">{entity.event}</span>
        </p>
        <TextField
          label={t.whatsappTemplatePhone}
          value={phone}
          helperText={t.whatsappTemplatePhoneHint}
          error={phoneError}
          required
          autoComplete="tel"
          disabled={isSendingTest}
          onChange={(event) => {
            setPhone(event.target.value);
            setPhoneError(undefined);
          }}
        />
        <WhatsAppTemplateParameterFields
          parameters={parameters}
          values={values}
          disabled={isSendingTest}
          onChange={(key, value) => setValues((current) => ({ ...current, [key]: value }))}
        />
        {result ? (
          <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-4">
            <p className={result.ok ? "text-sm font-medium text-success" : "text-sm font-medium text-destructive"}>
              {result.ok ? t.whatsappTemplateTestSent : result.error || t.whatsappTemplateTestFailed}
            </p>
            {result.messageId ? (
              <p className="font-mono text-xs break-all text-muted-foreground">
                {t.whatsappTemplateMessageId}: {result.messageId}
              </p>
            ) : null}
            {result.code && !result.ok ? (
              <p className="text-xs text-muted-foreground">
                {t.code}: {result.code}
              </p>
            ) : null}
            <WhatsAppTemplateMessage preview={result.rendered} />
          </div>
        ) : null}
      </form>
    </AppDialog>
  );
}
