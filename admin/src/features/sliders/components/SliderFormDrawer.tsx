import { SliderForm } from "@/features/sliders/components/SliderForm";
import { useSliderMutations } from "@/features/sliders/hooks/use-slider-mutations";
import type { Slider } from "@/features/sliders/types/sliders.types";
import { CrudDirtyFormDrawer } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type SliderFormDrawerProps = {
  open: boolean;
  mode: "create" | "edit";
  slider?: Slider | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void | Promise<void>;
};

export function SliderFormDrawer({
  open,
  mode,
  slider,
  onOpenChange,
  onSuccess,
}: SliderFormDrawerProps) {
  const t = useTranslation();
  const { save, isSaving } = useSliderMutations({ onSuccess });

  return (
    <CrudDirtyFormDrawer
      open={open}
      mode={mode}
      title={mode === "create" ? t.addSlide : t.editSlide}
      size="xl"
      isLoading={isSaving}
      onOpenChange={onOpenChange}
    >
      {({ onDirtyChange, requestClose, closeClean }) => (
        <SliderForm
          mode={mode}
          slider={slider}
          isLoading={isSaving}
          onCancel={requestClose}
          onDirtyChange={onDirtyChange}
          onSubmit={async (data) => {
            const result = await save(mode, data, slider ?? undefined);
            if (result) closeClean();
          }}
        />
      )}
    </CrudDirtyFormDrawer>
  );
}
