import { AreaForm } from "@/features/areas/components/AreaForm";
import { useAreaMutations } from "@/features/areas/hooks/use-area-mutations";
import type { Area } from "@/features/areas/types/areas.types";
import { CrudDirtyFormDrawer } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type AreaFormDrawerProps = {
  open: boolean;
  mode: "create" | "edit";
  area?: Area | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void | Promise<void>;
};

export function AreaFormDrawer({ open, mode, area, onOpenChange, onSuccess }: AreaFormDrawerProps) {
  const t = useTranslation();
  const { save, isSaving } = useAreaMutations({ onSuccess });

  return (
    <CrudDirtyFormDrawer
      open={open}
      mode={mode}
      title={mode === "create" ? t.addArea : t.editArea}
      size="md"
      isLoading={isSaving}
      onOpenChange={onOpenChange}
    >
      {({ onDirtyChange, requestClose, closeClean }) => (
        <AreaForm
          mode={mode}
          area={area}
          isLoading={isSaving}
          onCancel={requestClose}
          onDirtyChange={onDirtyChange}
          onSubmit={async (data) => {
            const result = await save(mode, data, area ?? undefined);
            if (result) closeClean();
          }}
        />
      )}
    </CrudDirtyFormDrawer>
  );
}
