import { DirectoryEntryForm } from "@/features/directory-entries/components/DirectoryEntryForm";
import { useDirectoryEntryMutations } from "@/features/directory-entries/hooks/use-directory-entry-mutations";
import type { DirectoryEntry } from "@/features/directory-entries/types/directory-entries.types";
import { CrudDirtyFormDrawer } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type DirectoryEntryFormDrawerProps = {
  open: boolean;
  mode: "create" | "edit";
  entry?: DirectoryEntry | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void | Promise<void>;
};

export function DirectoryEntryFormDrawer({
  open,
  mode,
  entry,
  onOpenChange,
  onSuccess,
}: DirectoryEntryFormDrawerProps) {
  const t = useTranslation();
  const { save, isSaving } = useDirectoryEntryMutations({ onSuccess });

  return (
    <CrudDirtyFormDrawer
      open={open}
      mode={mode}
      title={mode === "create" ? t.addDirectoryEntry : t.editDirectoryEntry}
      size="xl"
      isLoading={isSaving}
      onOpenChange={onOpenChange}
    >
      {({ onDirtyChange, requestClose, closeClean }) => (
        <DirectoryEntryForm
          mode={mode}
          entry={entry}
          isLoading={isSaving}
          onCancel={requestClose}
          onDirtyChange={onDirtyChange}
          onSubmit={async (data) => {
            const result = await save(mode, data, entry ?? undefined);
            if (result) closeClean();
          }}
        />
      )}
    </CrudDirtyFormDrawer>
  );
}
