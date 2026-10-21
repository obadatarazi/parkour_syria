import { useState } from "react";

import { AttributeValueForm } from "@/features/attribute-values/components/AttributeValueForm";
import { useAttributeValueMutations } from "@/features/attribute-values/hooks/use-attribute-value-mutations";
import type { AttributeValue } from "@/features/attribute-values/types/attribute-values.types";
import { ConfirmDialog } from "@/shared/components";
import { CrudEntityDrawer } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type AttributeValueFormDrawerProps = {
  open: boolean;
  mode: "create" | "edit";
  attributeValue?: AttributeValue | null;
  fixedAttributeId?: number;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void | Promise<void>;
};

export function AttributeValueFormDrawer({
  open,
  mode,
  attributeValue,
  fixedAttributeId,
  onOpenChange,
  onSuccess,
}: AttributeValueFormDrawerProps) {
  const t = useTranslation();
  const [isDirty, setIsDirty] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const { save, isSaving } = useAttributeValueMutations({
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
        formMode={mode}
        onOpenChange={(next) => (next ? onOpenChange(next) : requestClose())}
        title={mode === "create" ? t.addAttributeValue : t.editAttributeValue}
        size="lg"
        isLoading={isSaving}
      >
        <AttributeValueForm
          mode={mode}
          attributeValue={attributeValue}
          fixedAttributeId={fixedAttributeId}
          isLoading={isSaving}
          onCancel={requestClose}
          onDirtyChange={setIsDirty}
          onSubmit={async (data) => {
            const result = await save(mode, data, attributeValue ?? undefined);
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
