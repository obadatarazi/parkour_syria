import { useState } from "react";

import { TagForm } from "@/features/tags/components/TagForm";
import { useTagMutations } from "@/features/tags/hooks/use-tag-mutations";
import { tagsService } from "@/features/tags/services/tags.service";
import type { Tag } from "@/features/tags/types/tags.types";
import { ConfirmDialog } from "@/shared/components";
import { CrudEntityDrawer, useCrudQuery } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type TagFormDrawerProps = {
  open: boolean;
  mode: "create" | "edit";
  tag?: Tag | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void | Promise<void>;
};

export function TagFormDrawer({
  open,
  mode,
  tag,
  onOpenChange,
  onSuccess,
}: TagFormDrawerProps) {
  const t = useTranslation();
  const [isDirty, setIsDirty] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const { save, isSaving } = useTagMutations({
    onSuccess: async () => {
      await onSuccess();
      setIsDirty(false);
      onOpenChange(false);
    },
  });

  const { data: tagDetail, isLoading: isTagLoading } = useCrudQuery({
    queryKey: ["tags", "detail", String(tag?.id ?? "")],
    queryFn: () => tagsService.getById(tag!.id),
    enabled: open && mode === "edit" && Boolean(tag?.id),
  });

  const resolvedTag = mode === "edit" ? (tagDetail ?? tag) : tag;

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
        title={mode === "create" ? t.addTag : t.editTag}
        size="lg"
        isLoading={isSaving}
        isFetching={mode === "edit" && isTagLoading}
        fetchingLabel={t.loadingMessage}
      >
        <TagForm
          mode={mode}
          tag={resolvedTag}
          isLoading={isSaving || (mode === "edit" && isTagLoading)}
          onCancel={requestClose}
          onDirtyChange={setIsDirty}
          onSubmit={async (data) => {
            const result = await save(mode, data, resolvedTag ?? undefined);
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
