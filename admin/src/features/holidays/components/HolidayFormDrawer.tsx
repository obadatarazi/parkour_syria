import { useState } from "react";

import { HolidayForm } from "@/features/holidays/components/HolidayForm";
import { useHolidayMutations } from "@/features/holidays/hooks/use-holiday-mutations";
import type { Holiday } from "@/features/holidays/types/holidays.types";
import { ConfirmDialog } from "@/shared/components";
import { CrudEntityDrawer } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type HolidayFormDrawerProps = {
  open: boolean;
  mode: "create" | "edit";
  entity?: Holiday | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void | Promise<void>;
};

export function HolidayFormDrawer({
  open,
  mode,
  entity,
  onOpenChange,
  onSuccess,
}: HolidayFormDrawerProps) {
  const t = useTranslation();
  const [isDirty, setIsDirty] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const { save, isSaving } = useHolidayMutations({
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
        title={mode === "create" ? t.addHoliday : t.editHoliday}
        size="lg"
        isLoading={isSaving}
      >
        <HolidayForm
          mode={mode}
          entity={entity}
          isLoading={isSaving}
          onCancel={requestClose}
          onDirtyChange={setIsDirty}
          onSubmit={async (data) => {
            const result = await save(mode, data, entity ?? undefined);
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
