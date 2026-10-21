import { Link } from "react-router";

import { ROUTES } from "@/app/router/routes";
import type { LoyaltyRedemption } from "@/features/loyalty-redemptions/types/loyalty-redemptions.types";
import { loyaltyRedemptionStatusVariant } from "@/features/loyalty-redemptions/utils/map-loyalty-redemption-from-api";
import {
  orderCustomerHref,
  orderPartyDisplayName,
} from "@/features/orders/utils/order-customer-display";
import { PhoneNumberText, StatusBadge, UserLabelText } from "@/shared/components";
import { CrudDetailField, CrudViewDialog, type CrudViewDialogSection } from "@/shared/crud";
import {
  useLocalization,
  useTranslation,
} from "@/shared/design-system/localization/contexts/LocalizationContext";
import { getLoyaltyDisplayName } from "@/shared/lib/loyalty/loyalty-translations.utils";
import { formatDateTime } from "@/shared/lib/datetime.utils";

type LoyaltyRedemptionViewDialogProps = {
  open: boolean;
  redemption: LoyaltyRedemption | null;
  onOpenChange: (open: boolean) => void;
};

export function LoyaltyRedemptionViewDialog({
  open,
  redemption,
  onOpenChange,
}: LoyaltyRedemptionViewDialogProps) {
  const t = useTranslation();
  const { language } = useLocalization();

  if (!redemption) return null;

  const reward = redemption.loyaltyReward;
  const rewardNames = getLoyaltyDisplayName(reward?.translations, reward?.name);
  const rewardLabel = rewardNames.en || rewardNames.ar || reward?.code || t.notSet;
  const user = redemption.user;
  const customerName = orderPartyDisplayName(
    {
      fullName: user?.fullName,
      email: user?.email,
      phoneNumber: user?.phoneNumber,
      userId: user?.id ?? redemption.userId,
    },
    `#${redemption.userId ?? user?.id ?? "?"}`,
  );
  const customerHref = orderCustomerHref({
    userId: user?.id ?? redemption.userId ?? null,
    fullName: user?.fullName,
    email: user?.email,
    phoneNumber: user?.phoneNumber,
  });
  const statusLabel =
    redemption.status?.label || redemption.status?.value || t.notSet;

  const sections: CrudViewDialogSection[] = [
    {
      id: "details",
      title: t.viewDetails,
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          <CrudDetailField label="ID">{redemption.id}</CrudDetailField>
          <CrudDetailField label={t.loyaltyRedemptionStatus}>{statusLabel}</CrudDetailField>
          <CrudDetailField label={t.loyaltyRedemptionPoints}>{redemption.points}</CrudDetailField>
          <CrudDetailField label={t.loyaltyRedemptionRedeemedAt}>
            {redemption.redeemedAt
              ? formatDateTime(redemption.redeemedAt, language)
              : t.notSet}
          </CrudDetailField>
          <CrudDetailField label={t.loyaltyRedemptionExpiresAt}>
            {redemption.expiresAt
              ? formatDateTime(redemption.expiresAt, language)
              : t.notSet}
          </CrudDetailField>
          <CrudDetailField label={t.date}>
            {redemption.createdAt
              ? formatDateTime(redemption.createdAt, language)
              : t.notSet}
          </CrudDetailField>
        </div>
      ),
    },
    {
      id: "customer",
      title: t.customer,
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          <CrudDetailField label={t.fullName}>
            {customerHref ? (
              <Link to={customerHref} className="font-medium text-brand hover:underline">
                <UserLabelText value={customerName} />
              </Link>
            ) : (
              <UserLabelText value={customerName} />
            )}
          </CrudDetailField>
          <CrudDetailField label={t.email}>{user?.email || t.notSet}</CrudDetailField>
          <CrudDetailField label={t.phone}>
            <PhoneNumberText value={user?.phoneNumber} fallback={t.notSet} />
          </CrudDetailField>
        </div>
      ),
    },
    {
      id: "reward",
      title: t.loyaltyRewards,
      content: reward ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <CrudDetailField label="ID">{reward.id}</CrudDetailField>
          <CrudDetailField label={t.loyaltyRewardCode}>
            <span className="font-mono text-sm">{reward.code}</span>
          </CrudDetailField>
          <CrudDetailField label={t.name}>{rewardLabel}</CrudDetailField>
          <CrudDetailField label={t.loyaltyRewardType}>
            {reward.type?.label || reward.type?.value || t.notSet}
          </CrudDetailField>
          <CrudDetailField label={t.loyaltyRewardPointsCost}>{reward.pointsCost}</CrudDetailField>
          <CrudDetailField label={t.loyaltyRewardValue}>
            {reward.rewardValue ?? t.notSet}
          </CrudDetailField>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{t.notSet}</p>
      ),
    },
  ];

  return (
    <CrudViewDialog
      open={open}
      entity={redemption}
      onOpenChange={onOpenChange}
      title={t.viewLoyaltyRedemption}
      cancelLabel={t.close}
      canUpdate={false}
      canDelete={false}
      sections={sections}
      hero={
        <div className="space-y-3">
          <p className="font-mono text-lg font-semibold text-brand">#{redemption.id}</p>
          <div className="flex flex-wrap gap-2">
            <StatusBadge
              label={statusLabel}
              variant={loyaltyRedemptionStatusVariant(redemption.status?.value)}
            />
            <StatusBadge
              label={`${t.loyaltyRedemptionPoints}: ${redemption.points}`}
              variant="info"
            />
            {reward?.code ? (
              <StatusBadge label={reward.code} variant="neutral" />
            ) : null}
          </div>
          {reward ? (
            <Link
              to={`${ROUTES.admin.loyaltyRewards}?search=${encodeURIComponent(reward.code)}`}
              className="text-sm font-medium text-brand hover:underline"
            >
              {rewardLabel}
            </Link>
          ) : null}
        </div>
      }
    />
  );
}
