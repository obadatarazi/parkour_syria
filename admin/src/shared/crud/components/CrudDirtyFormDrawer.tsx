import { type ReactNode, useState } from "react";

import { ConfirmDialog } from "@/shared/components";
import type { AppDrawerSize } from "@/shared/components/overlay/AppDrawer";
import { CrudEntityDrawer } from "@/shared/crud/components/CrudEntityDrawer";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type CrudDirtyFormDrawerRenderProps = {
  onDirtyChange: (isDirty: boolean) => void;
  /** Closes, asking first when the form has unsaved changes. */
  requestClose: () => void;
  /** Closes without asking, for a save that had nothing to send. */
  closeClean: () => void;
};

type CrudDirtyFormDrawerProps = {
  open: boolean;
  mode: "create" | "edit";
  title: string;
  size?: AppDrawerSize;
  isLoading?: boolean;
  onOpenChange: (open: boolean) => void;
  children: (props: CrudDirtyFormDrawerRenderProps) => ReactNode;
};

/**
 * The create / edit drawer every overlay feature uses, with the discard-changes confirmation the
 * `countries` drawer has.
 */
export function CrudDirtyFormDrawer({
  open,
  mode,
  title,
  size = "lg",
  isLoading,
  onOpenChange,
  children,
}: CrudDirtyFormDrawerProps) {
  const t = useTranslation();
  const [isDirty, setIsDirty] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const closeClean = () => {
    setIsDirty(false);
    onOpenChange(false);
  };

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
        title={title}
        size={size}
        isLoading={isLoading}
      >
        {children({ onDirtyChange: setIsDirty, requestClose, closeClean })}
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
          closeClean();
        }}
      />
    </>
  );
}
