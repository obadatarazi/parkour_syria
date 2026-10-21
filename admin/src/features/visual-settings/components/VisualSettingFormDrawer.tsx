import { VisualSettingForm } from "@/features/visual-settings/components/VisualSettingForm";
import { useVisualSettingMutations } from "@/features/visual-settings/hooks/use-visual-setting-mutations";
import type { VisualSetting } from "@/features/visual-settings/types/visual-settings.types";
import { formatVisualSettingKey } from "@/features/visual-settings/types/visual-settings.types";
import { CrudEntityDrawer } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type VisualSettingFormDrawerProps = {
  open: boolean;
  setting?: VisualSetting | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void | Promise<void>;
};

export function VisualSettingFormDrawer({
  open,
  setting,
  onOpenChange,
  onSuccess,
}: VisualSettingFormDrawerProps) {
  const t = useTranslation();
  const { save, isSaving } = useVisualSettingMutations({
    onSuccess: async () => {
      await onSuccess();
      onOpenChange(false);
    },
  });

  return (
    <CrudEntityDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={
        setting
          ? `${t.editVisualSetting}: ${formatVisualSettingKey(setting.settingKey)}`
          : t.editVisualSetting
      }
      size="md"
      isLoading={isSaving}
    >
      <VisualSettingForm
        setting={setting}
        isLoading={isSaving}
        onCancel={() => onOpenChange(false)}
        onSubmit={async (data) => {
          if (!setting) return;
          const result = await save(data, setting);
          if (result === "skipped") onOpenChange(false);
        }}
      />
    </CrudEntityDrawer>
  );
}
