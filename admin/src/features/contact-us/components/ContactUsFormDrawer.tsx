import { useState } from "react";

import { ContactUsForm } from "@/features/contact-us/components/ContactUsForm";
import { useContactUsMutations } from "@/features/contact-us/hooks/use-contact-us-mutations";
import type { ContactUsMessage } from "@/features/contact-us/types/contact-us.types";
import { ConfirmDialog } from "@/shared/components";
import { CrudEntityDrawer } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type ContactUsFormDrawerProps = {
  open: boolean;
  message?: ContactUsMessage | null;
  canUpdate?: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void | Promise<void>;
};

export function ContactUsFormDrawer({
  open,
  message,
  canUpdate = false,
  onOpenChange,
  onSuccess,
}: ContactUsFormDrawerProps) {
  const t = useTranslation();
  const [isDirty, setIsDirty] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const { save, isSaving } = useContactUsMutations({
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
        open={open}
        onOpenChange={(next) => (next ? onOpenChange(next) : requestClose())}
        title={canUpdate ? t.editContactMessage : t.viewContactMessage}
        size="md"
        isLoading={isSaving}
      >
        <ContactUsForm
          message={message}
          canUpdate={canUpdate}
          isLoading={isSaving}
          onCancel={requestClose}
          onDirtyChange={setIsDirty}
          onSubmit={async (data) => {
            if (!message) return;
            const result = await save(data, message);
            if (result === "skipped") {
              setIsDirty(false);
              onOpenChange(false);
            }
          }}
        />
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
