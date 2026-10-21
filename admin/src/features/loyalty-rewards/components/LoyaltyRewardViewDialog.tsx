import type { LoyaltyReward } from "@/features/loyalty-rewards/types/loyalty-rewards.types";
import { extractMinimumCartTotal } from "@/features/loyalty-rewards/types/loyalty-rewards.types";
import { StatusBadge } from "@/shared/components";
import { CrudDetailField, CrudViewDialog, type CrudViewDialogSection } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { getLoyaltyDisplayName } from "@/shared/lib/loyalty/loyalty-translations.utils";

type LoyaltyRewardViewDialogProps = {
  open: boolean;
  reward: LoyaltyReward | null;
  canUpdate?: boolean;
  canDelete?: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (reward: LoyaltyReward) => void;
  onDelete?: (reward: LoyaltyReward) => void;
};

function formatRewardValue(reward: LoyaltyReward, notSet: string): string {
  if (reward.type?.value === "FREE_SHIPPING") return notSet;
  if (reward.rewardValue == null) return notSet;
  return String(reward.rewardValue);
}

export function LoyaltyRewardViewDialog({
  open,
  reward,
  canUpdate = false,
  canDelete = false,
  onOpenChange,
  onEdit,
  onDelete,
}: LoyaltyRewardViewDialogProps) {
  const t = useTranslation();

  if (!reward) return null;

  const names = getLoyaltyDisplayName(reward.translations, reward.name);
  const minimumCartTotal = extractMinimumCartTotal(reward.conditions);

  const sections: CrudViewDialogSection[] = [
    {
      id: "content",
      title: t.tagContent,
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          <CrudDetailField label={t.loyaltyNameEnglish}>
            {names.en || <span className="text-muted-foreground">{t.notSet}</span>}
          </CrudDetailField>
          <CrudDetailField label={t.loyaltyNameArabic}>
            {names.ar ? (
              <span dir="rtl" className="block">
                {names.ar}
              </span>
            ) : (
              <span className="text-muted-foreground">{t.notSet}</span>
            )}
          </CrudDetailField>
          <div className="sm:col-span-2">
            <CrudDetailField label={t.descriptionEnglish}>
              {reward.translations?.en?.description?.trim() || (
                <span className="text-muted-foreground">{t.notSet}</span>
              )}
            </CrudDetailField>
          </div>
          <div className="sm:col-span-2">
            <CrudDetailField label={t.descriptionArabic}>
              {reward.translations?.ar?.description?.trim() ? (
                <span dir="rtl" className="block">
                  {reward.translations.ar.description}
                </span>
              ) : (
                <span className="text-muted-foreground">{t.notSet}</span>
              )}
            </CrudDetailField>
          </div>
        </div>
      ),
    },
    {
      id: "details",
      title: t.loyaltyRewards,
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          <CrudDetailField label="ID">{reward.id}</CrudDetailField>
          <CrudDetailField label={t.loyaltyRewardCode}>
            <span className="font-mono text-sm">{reward.code}</span>
          </CrudDetailField>
          <CrudDetailField label={t.loyaltyRewardType}>
            {reward.type?.label || reward.type?.value || t.notSet}
          </CrudDetailField>
          <CrudDetailField label={t.loyaltyRewardPointsCost}>{reward.pointsCost}</CrudDetailField>
          <CrudDetailField label={t.loyaltyRewardValue}>
            {formatRewardValue(reward, t.notSet)}
          </CrudDetailField>
          <CrudDetailField label={t.loyaltyRewardUsageLimit}>
            {reward.usageLimit ?? <span className="text-muted-foreground">{t.notSet}</span>}
          </CrudDetailField>
          <CrudDetailField label={t.loyaltyRewardExpiresAfterDays}>
            {reward.expiresAfterDays ?? (
              <span className="text-muted-foreground">{t.notSet}</span>
            )}
          </CrudDetailField>
          <CrudDetailField label={t.loyaltyMinimumCartTotal}>
            {minimumCartTotal ?? <span className="text-muted-foreground">{t.notSet}</span>}
          </CrudDetailField>
        </div>
      ),
    },
  ];

  return (
    <CrudViewDialog
      open={open}
      entity={reward}
      onOpenChange={onOpenChange}
      title={t.viewLoyaltyReward}
      cancelLabel={t.cancel}
      canUpdate={canUpdate}
      canDelete={canDelete}
      editLabel={t.editAction}
      deleteLabel={t.deleteAction}
      onEdit={onEdit}
      onDelete={onDelete}
      sections={sections}
      hero={
        <div className="space-y-3">
          <div>
            <p className="text-lg font-semibold text-foreground">{names.en || names.ar}</p>
            {names.ar && names.en ? (
              <p dir="rtl" className="mt-1 text-sm text-muted-foreground">
                {names.ar}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge
              label={reward.isActive ? t.active : t.inactive}
              variant={reward.isActive ? "success" : "neutral"}
            />
            <StatusBadge
              label={reward.type?.label || reward.type?.value || t.notSet}
              variant="info"
            />
          </div>
        </div>
      }
    />
  );
}
