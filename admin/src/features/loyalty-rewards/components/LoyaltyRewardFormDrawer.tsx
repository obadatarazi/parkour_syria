import { useState } from "react";

import { LoyaltyRewardForm } from "@/features/loyalty-rewards/components/LoyaltyRewardForm";
import { useLoyaltyRewardMutations } from "@/features/loyalty-rewards/hooks/use-loyalty-reward-mutations";
import { loyaltyRewardsService } from "@/features/loyalty-rewards/services/loyalty-rewards.service";
import type { LoyaltyReward } from "@/features/loyalty-rewards/types/loyalty-rewards.types";
import { ConfirmDialog } from "@/shared/components";
import { CrudEntityDrawer, useCrudQuery } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type LoyaltyRewardFormDrawerProps = {
  open: boolean;
  mode: "create" | "edit";
  reward?: LoyaltyReward | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void | Promise<void>;
};

export function LoyaltyRewardFormDrawer({
  open,
  mode,
  reward,
  onOpenChange,
  onSuccess,
}: LoyaltyRewardFormDrawerProps) {
  const t = useTranslation();
  const [isDirty, setIsDirty] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const { save, isSaving } = useLoyaltyRewardMutations({
    onSuccess: async () => {
      await onSuccess();
      setIsDirty(false);
      onOpenChange(false);
    },
  });

  const { data: rewardDetail, isLoading: isRewardLoading } = useCrudQuery({
    queryKey: ["loyalty-rewards", "detail", String(reward?.id ?? "")],
    queryFn: () => loyaltyRewardsService.getById(reward!.id),
    enabled: open && mode === "edit" && Boolean(reward?.id),
  });

  const resolvedReward = mode === "edit" ? (rewardDetail ?? reward) : reward;

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
        title={mode === "create" ? t.addLoyaltyReward : t.editLoyaltyReward}
        size="lg"
        isLoading={isSaving}
        isFetching={mode === "edit" && isRewardLoading}
        fetchingLabel={t.loadingMessage}
      >
        <LoyaltyRewardForm
          mode={mode}
          reward={resolvedReward}
          isLoading={isSaving || (mode === "edit" && isRewardLoading)}
          onCancel={requestClose}
          onDirtyChange={setIsDirty}
          onSubmit={async (data) => {
            const result = await save(mode, data, resolvedReward ?? undefined);
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
