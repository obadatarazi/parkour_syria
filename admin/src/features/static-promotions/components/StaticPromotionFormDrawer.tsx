import { StaticPromotionForm } from "@/features/static-promotions/components/StaticPromotionForm";
import { useStaticPromotionMutations } from "@/features/static-promotions/hooks/use-static-promotion-mutations";
import type { StaticPromotion } from "@/features/static-promotions/types/static-promotions.types";
import { CrudEntityDrawer } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type StaticPromotionFormDrawerProps = {
  open: boolean;
  mode: "create" | "edit";
  promotion?: StaticPromotion | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void | Promise<void>;
};

export function StaticPromotionFormDrawer({
  open,
  mode,
  promotion,
  onOpenChange,
  onSuccess,
}: StaticPromotionFormDrawerProps) {
  const t = useTranslation();
  const { save, isSaving } = useStaticPromotionMutations({
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
      title={mode === "create" ? t.addStaticPromotion : t.editStaticPromotion}
      size="lg"
      isLoading={isSaving}
    >
      <StaticPromotionForm
        mode={mode}
        promotion={promotion}
        isLoading={isSaving}
        onCancel={() => onOpenChange(false)}
        onSubmit={async (data) => {
          const result = await save(mode, data, promotion ?? undefined);
          if (result === "skipped") onOpenChange(false);
        }}
      />
    </CrudEntityDrawer>
  );
}
