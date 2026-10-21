import { SettingForm } from "@/features/settings/components/SettingForm";
import { useSettingMutations } from "@/features/settings/hooks/use-setting-mutations";
import type { MultiTypeSetting } from "@/features/settings/types/settings.types";
import { CrudEntityDrawer } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type SettingFormDrawerProps = {
  open: boolean;
  mode: "create" | "edit";
  setting?: MultiTypeSetting | null;
  valueEditable?: boolean;
  valueLockedHint?: string;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void | Promise<void>;
};

export function SettingFormDrawer({
  open,
  mode,
  setting,
  valueEditable = true,
  valueLockedHint,
  onOpenChange,
  onSuccess,
}: SettingFormDrawerProps) {
  const t = useTranslation();
  const { save, isSaving } = useSettingMutations({
    onSuccess: async () => {
      await onSuccess();
      onOpenChange(false);
    },
  });

  return (
    <CrudEntityDrawer
      open={open}
      formMode={mode}
      onOpenChange={onOpenChange}
      title={mode === "create" ? t.addSetting : t.editSetting}
      size="sm"
      isLoading={isSaving}
    >
      <SettingForm
        mode={mode}
        setting={setting}
        isLoading={isSaving}
        valueEditable={valueEditable}
        valueLockedHint={valueLockedHint}
        onCancel={() => onOpenChange(false)}
        onSubmit={async (data) => {
          const result = await save(mode, data, setting ?? undefined);
          if (result === "skipped") onOpenChange(false);
        }}
      />
    </CrudEntityDrawer>
  );
}
