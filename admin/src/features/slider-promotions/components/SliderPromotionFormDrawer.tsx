import { SliderPromotionForm } from "@/features/slider-promotions/components/SliderPromotionForm";
import { useSliderPromotionMutations } from "@/features/slider-promotions/hooks/use-slider-promotion-mutations";
import { sliderPromotionsService } from "@/features/slider-promotions/services/slider-promotions.service";
import type { SliderPromotion } from "@/features/slider-promotions/types/slider-promotions.types";
import { CrudEntityDrawer, useCrudQuery } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type SliderPromotionFormDrawerProps = {
  open: boolean;
  mode: "create" | "edit";
  promotion?: SliderPromotion | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void | Promise<void>;
};

export function SliderPromotionFormDrawer({
  open,
  mode,
  promotion,
  onOpenChange,
  onSuccess,
}: SliderPromotionFormDrawerProps) {
  const t = useTranslation();
  const { save, isSaving } = useSliderPromotionMutations({
    onSuccess: async () => {
      await onSuccess();
      onOpenChange(false);
    },
  });

  // List is slim (featuredImageUrl/imagesCount only). Edit loads full images via getById.
  const { data: promotionDetail, isLoading: isPromotionLoading } = useCrudQuery({
    queryKey: ["slider-promotions", "detail", String(promotion?.id ?? "")],
    queryFn: () => sliderPromotionsService.getById(promotion!.id),
    enabled: open && mode === "edit" && Boolean(promotion?.id),
  });

  const resolvedPromotion =
    mode === "edit" ? (promotionDetail ?? promotion) : promotion;

  return (
    <CrudEntityDrawer
      open={open}
      formMode={mode}
      onOpenChange={onOpenChange}
      title={mode === "create" ? t.addSliderPromotion : t.editSliderPromotion}
      size="lg"
      isLoading={isSaving}
      isFetching={mode === "edit" && isPromotionLoading}
      fetchingLabel={t.loadingMessage}
    >
      <SliderPromotionForm
        mode={mode}
        promotion={resolvedPromotion}
        isLoading={isSaving || (mode === "edit" && isPromotionLoading)}
        onCancel={() => onOpenChange(false)}
        onSubmit={async (data) => {
          const result = await save(mode, data, resolvedPromotion ?? undefined);
          if (result === "skipped") onOpenChange(false);
        }}
      />
    </CrudEntityDrawer>
  );
}
