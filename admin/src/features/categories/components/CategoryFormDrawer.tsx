import { useEffect, useRef, useState } from "react";

import { CategoryForm } from "@/features/categories/components/CategoryForm";
import { useCategoryMutations } from "@/features/categories/hooks/use-category-mutations";
import type { Category } from "@/features/categories/types/categories.types";
import { ConfirmDialog } from "@/shared/components";
import { CrudEntityDrawer } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type CategoryFormDrawerProps = {
  open: boolean;
  mode: "create" | "edit";
  category?: Category | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void | Promise<void>;
};

export function CategoryFormDrawer({
  open,
  mode,
  category,
  onOpenChange,
  onSuccess,
}: CategoryFormDrawerProps) {
  const t = useTranslation();
  const [isDirty, setIsDirty] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const { save, isSaving } = useCategoryMutations({
    onSuccess: async () => {
      await onSuccess();
      setIsDirty(false);
      onOpenChange(false);
    },
  });

  /**
   * Increments only on the rising edge of an open create session
   * (open create, or switch Edit → Create while the drawer stays open).
   */
  const [createSessionKey, setCreateSessionKey] = useState(0);
  const wasCreateOpenRef = useRef(false);

  useEffect(() => {
    const isCreateOpen = open && mode === "create";
    if (isCreateOpen && !wasCreateOpenRef.current) {
      setCreateSessionKey((current) => current + 1);
    }
    wasCreateOpenRef.current = isCreateOpen;
  }, [open, mode]);

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
        title={mode === "create" ? t.addCategory : t.editCategory}
        size="lg"
        isLoading={isSaving}
      >
        <CategoryForm
          key={
            mode === "create"
              ? `create-${createSessionKey}`
              : `edit-${category?.id ?? "none"}`
          }
          mode={mode}
          category={category}
          createSessionKey={mode === "create" ? createSessionKey : undefined}
          isLoading={isSaving}
          onCancel={requestClose}
          onDirtyChange={setIsDirty}
          onSubmit={async (data) => {
            const result = await save(mode, data, category ?? undefined);
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
