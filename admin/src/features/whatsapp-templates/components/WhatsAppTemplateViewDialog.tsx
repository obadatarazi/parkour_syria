import { useEffect, useState } from "react";

import { WhatsAppTemplateMessage } from "@/features/whatsapp-templates/components/WhatsAppTemplateMessage";
import { WhatsAppTemplateParameterFields } from "@/features/whatsapp-templates/components/WhatsAppTemplateParameterFields";
import { useWhatsAppTemplateMutations } from "@/features/whatsapp-templates/hooks/use-whatsapp-template-mutations";
import type {
  WhatsAppTemplate,
  WhatsAppTemplatePreview,
} from "@/features/whatsapp-templates/types/whatsapp-templates.types";
import {
  compactWhatsAppParameters,
  resolveWhatsAppTemplateStatusLabel,
  whatsAppTemplateStatusVariant,
} from "@/features/whatsapp-templates/utils/whatsapp-template-display";
import { AppButton, StatusBadge } from "@/shared/components";
import { CrudDetailField, CrudViewDialog, type CrudViewDialogSection } from "@/shared/crud";
import {
  useLocalization,
  useTranslation,
} from "@/shared/design-system/localization/contexts/LocalizationContext";
import { formatDateTime } from "@/shared/lib/datetime.utils";

type WhatsAppTemplateViewDialogProps = {
  open: boolean;
  entity: WhatsAppTemplate | null;
  canUpdate?: boolean;
  canSendTest?: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (entity: WhatsAppTemplate) => void;
  onSendTest?: (entity: WhatsAppTemplate) => void;
};

export function WhatsAppTemplateViewDialog({
  open,
  entity,
  canUpdate = false,
  canSendTest = false,
  onOpenChange,
  onEdit,
  onSendTest,
}: WhatsAppTemplateViewDialogProps) {
  const t = useTranslation();
  const { language } = useLocalization();
  const { previewMutation, isPreviewing } = useWhatsAppTemplateMutations();
  const [override, setOverride] = useState<WhatsAppTemplatePreview | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    setOverride(null);
    setValues({});
  }, [entity?.event]);

  const preview = override ?? entity?.preview ?? null;

  if (!entity || !preview) return null;

  const refreshPreview = async () => {
    const result = await previewMutation.mutate({
      event: entity.event,
      parameters: compactWhatsAppParameters(values),
    });
    if (result.ok && result.data) {
      setOverride(result.data);
    }
  };

  const sections: CrudViewDialogSection[] = [
    {
      id: "preview",
      title: t.whatsappTemplatePreview,
      content: (
        <div className="space-y-4">
          {!preview.available ? (
            <p className="text-sm text-muted-foreground">{t.whatsappTemplatePreviewUnavailable}</p>
          ) : null}
          <WhatsAppTemplateMessage preview={preview} />
          {preview.warnings.length > 0 ? (
            <ul className="space-y-1 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {preview.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          ) : null}
          <WhatsAppTemplateParameterFields
            parameters={preview.parameters}
            values={values}
            disabled={isPreviewing}
            onChange={(key, value) => setValues((current) => ({ ...current, [key]: value }))}
          />
          {preview.parameters.length > 0 ? (
            <AppButton
              type="button"
              variant="outline"
              isLoading={isPreviewing}
              loadingText={t.loadingMessage}
              onClick={() => {
                void refreshPreview();
              }}
            >
              {t.whatsappTemplateRefreshPreview}
            </AppButton>
          ) : null}
        </div>
      ),
    },
    {
      id: "details",
      title: t.whatsappTemplateDetails,
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          <CrudDetailField label={t.whatsappTemplateEvent}>
            <span className="font-mono text-xs">{entity.event}</span>
          </CrudDetailField>
          <CrudDetailField label={t.whatsappTemplateName}>
            {entity.templateName ?? "—"}
          </CrudDetailField>
          <CrudDetailField label={t.whatsappTemplateLanguage}>{entity.language ?? "—"}</CrudDetailField>
          <CrudDetailField label={t.whatsappTemplateCategory}>{entity.category ?? "—"}</CrudDetailField>
          <CrudDetailField label={t.whatsappTemplateMetaStatus}>
            {entity.metaStatus ?? "—"}
          </CrudDetailField>
          <CrudDetailField label={t.whatsappTemplatePlaceholders}>
            {t.whatsappTemplateDeclaredOnMeta}: {entity.placeholders.declaredOnMeta ?? "—"}
            {" · "}
            {t.whatsappTemplateSentByApp}: {entity.placeholders.sentByApp}
          </CrudDetailField>
          <CrudDetailField label={t.whatsappTemplateNote}>{entity.note ?? "—"}</CrudDetailField>
          <CrudDetailField label={t.whatsappTemplateUpdatedBy}>
            {entity.updatedBy?.fullName ?? "—"}
            {entity.updatedAt ? (
              <span className="mt-1 block text-xs text-muted-foreground">
                {formatDateTime(entity.updatedAt, language)}
              </span>
            ) : null}
          </CrudDetailField>
        </div>
      ),
    },
  ];

  return (
    <CrudViewDialog
      open={open}
      entity={entity}
      onOpenChange={onOpenChange}
      title={t.viewWhatsAppTemplate}
      size="xl"
      cancelLabel={t.cancel}
      canUpdate={canUpdate}
      canDelete={false}
      editLabel={t.editAction}
      onEdit={onEdit}
      sections={sections}
      footerActions={
        canSendTest && onSendTest ? (
          <AppButton variant="outline" onClick={() => onSendTest(entity)}>
            {t.whatsappTemplateSendTest}
          </AppButton>
        ) : null
      }
      hero={
        <div className="space-y-3">
          <div>
            <p className="text-lg font-semibold text-foreground">{entity.label}</p>
            {entity.description ? (
              <p className="mt-1 text-sm text-muted-foreground">{entity.description}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge
              label={resolveWhatsAppTemplateStatusLabel(
                entity.status.value,
                entity.status.label,
                t,
              )}
              variant={whatsAppTemplateStatusVariant(entity.status.value)}
            />
            <StatusBadge
              label={entity.isEnabled ? t.whatsappTemplateEnabled : t.whatsappTemplateDisabled}
              variant={entity.isEnabled ? "success" : "neutral"}
            />
            {entity.isCritical ? (
              <StatusBadge label={t.whatsappTemplateCritical} variant="warning" />
            ) : null}
          </div>
        </div>
      }
    />
  );
}
