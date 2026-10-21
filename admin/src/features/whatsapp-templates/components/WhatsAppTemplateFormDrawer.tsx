import { useState } from "react";

import { WhatsAppTemplateForm } from "@/features/whatsapp-templates/components/WhatsAppTemplateForm";
import { useWhatsAppTemplateMutations } from "@/features/whatsapp-templates/hooks/use-whatsapp-template-mutations";
import type { WhatsAppTemplate } from "@/features/whatsapp-templates/types/whatsapp-templates.types";
import { ConfirmDialog } from "@/shared/components";
import { CrudEntityDrawer } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type WhatsAppTemplateFormDrawerProps = {
  open: boolean;
  entity?: WhatsAppTemplate | null;
  canTurnOff: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void | Promise<void>;
};

export function WhatsAppTemplateFormDrawer({
  open,
  entity,
  canTurnOff,
  onOpenChange,
  onSuccess,
}: WhatsAppTemplateFormDrawerProps) {
  const t = useTranslation();
  const [isDirty, setIsDirty] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const { save, isSaving } = useWhatsAppTemplateMutations({
    onSuccess: async () => {
      await onSuccess();
      setIsDirty(false);
      onOpenChange(false);
    },
  });

  const requestClose = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
      return;
    }
    onOpenChange(false);
  };

  return (
    <>
      <CrudEntityDrawer
        open={open && entity != null}
        formMode="edit"
        onOpenChange={(next) => (next ? onOpenChange(next) : requestClose())}
        title={t.editWhatsAppTemplate}
        size="lg"
        isLoading={isSaving}
      >
        {entity ? (
          <WhatsAppTemplateForm
            entity={entity}
            canTurnOff={canTurnOff}
            isLoading={isSaving}
            onCancel={requestClose}
            onDirtyChange={setIsDirty}
            onSubmit={async (data) => {
              const result = await save(data, entity);
              if (result === "skipped") {
                setIsDirty(false);
                onOpenChange(false);
              }
            }}
          />
        ) : null}
      </CrudEntityDrawer>

      <ConfirmDialog
        open={showDiscardConfirm}
        onOpenChange={setShowDiscardConfirm}
        title={t.discardChangesTitle}
        description={t.discardChangesDescription}
        confirmLabel={t.discardChangesConfirm}
        cancelLabel={t.cancel}
        variant="destructive"
        onConfirm={() => {
          setShowDiscardConfirm(false);
          setIsDirty(false);
          onOpenChange(false);
        }}
      />
    </>
  );
}
