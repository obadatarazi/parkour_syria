import { Link } from "react-router";

import { orderViewPath } from "@/app/router/routes";
import type { LoyaltyLedgerEntry } from "@/features/loyalty-ledger/types/loyalty-ledger.types";
import {
  formatLedgerPoints,
  loyaltyLedgerTypeVariant,
} from "@/features/loyalty-ledger/utils/map-loyalty-ledger-from-api";
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
import { formatDateTime } from "@/shared/lib/datetime.utils";
import { getLoyaltyDisplayName } from "@/shared/lib/loyalty/loyalty-translations.utils";

type LoyaltyLedgerViewDialogProps = {
  open: boolean;
  entry: LoyaltyLedgerEntry | null;
  onOpenChange: (open: boolean) => void;
};

export function LoyaltyLedgerViewDialog({
  open,
  entry,
  onOpenChange,
}: LoyaltyLedgerViewDialogProps) {
  const t = useTranslation();
  const { language } = useLocalization();

  if (!entry) return null;

  const user = entry.user;
  const customerName = orderPartyDisplayName(
    {
      fullName: user?.fullName,
      email: user?.email,
      phoneNumber: user?.phoneNumber,
      userId: user?.id ?? entry.userId,
    },
    `#${entry.userId ?? user?.id ?? "?"}`,
  );
  const customerHref = orderCustomerHref({
    userId: user?.id ?? entry.userId ?? null,
    fullName: user?.fullName,
    email: user?.email,
    phoneNumber: user?.phoneNumber,
  });
  const typeLabel = entry.type?.label || entry.type?.value || t.notSet;
  const event = entry.loyaltyEvent;
  const eventNames = getLoyaltyDisplayName(event?.translations, event?.name);
  const eventLabel = eventNames.en || eventNames.ar || event?.code || t.notSet;
  const reward = entry.loyaltyReward;
  const rewardNames = getLoyaltyDisplayName(reward?.translations, reward?.name);
  const rewardLabel = rewardNames.en || rewardNames.ar || reward?.code || t.notSet;
  const order = entry.order;
  const orderLabel = order?.orderRefNumber || (order?.id ? `#${order.id}` : t.notSet);
  const orderHref = order?.orderRefNumber
    ? orderViewPath(order.orderRefNumber)
    : order?.id
      ? orderViewPath(String(order.id))
      : null;

  const sections: CrudViewDialogSection[] = [
    {
      id: "details",
      title: t.viewDetails,
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          <CrudDetailField label="ID">{entry.id}</CrudDetailField>
          <CrudDetailField label={t.loyaltyLedgerType}>{typeLabel}</CrudDetailField>
          <CrudDetailField label={t.loyaltyLedgerPoints}>
            {formatLedgerPoints(entry.points)}
          </CrudDetailField>
          <CrudDetailField label={t.loyaltyLedgerBalanceAfter}>{entry.balanceAfter}</CrudDetailField>
          <CrudDetailField label={t.loyaltyLedgerNote}>
            {entry.note?.trim() || t.notSet}
          </CrudDetailField>
          <CrudDetailField label={t.date}>
            {entry.createdAt ? formatDateTime(entry.createdAt, language) : t.notSet}
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
  ];

  if (event) {
    sections.push({
      id: "event",
      title: t.loyaltyEvents,
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          <CrudDetailField label="ID">{event.id}</CrudDetailField>
          <CrudDetailField label={t.loyaltyEventCode}>
            <span className="font-mono text-sm">{event.code}</span>
          </CrudDetailField>
          <CrudDetailField label={t.name}>{eventLabel}</CrudDetailField>
          <CrudDetailField label={t.loyaltyEventType}>
            {event.type?.label || event.type?.value || t.notSet}
          </CrudDetailField>
          <CrudDetailField label={t.loyaltyEventPoints}>{event.points}</CrudDetailField>
        </div>
      ),
    });
  }

  if (reward) {
    sections.push({
      id: "reward",
      title: t.loyaltyRewards,
      content: (
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
        </div>
      ),
    });
  }

  if (order) {
    sections.push({
      id: "order",
      title: t.orderNum,
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          <CrudDetailField label="ID">{order.id}</CrudDetailField>
          <CrudDetailField label={t.orderNum}>
            {orderHref ? (
              <Link to={orderHref} className="font-mono text-brand hover:underline">
                {orderLabel}
              </Link>
            ) : (
              orderLabel
            )}
          </CrudDetailField>
        </div>
      ),
    });
  }

  return (
    <CrudViewDialog
      open={open}
      entity={entry}
      onOpenChange={onOpenChange}
      title={t.viewLoyaltyLedgerEntry}
      cancelLabel={t.close}
      canUpdate={false}
      canDelete={false}
      sections={sections}
      hero={
        <div className="space-y-3">
          <p className="font-mono text-lg font-semibold text-brand">#{entry.id}</p>
          <div className="flex flex-wrap gap-2">
            <StatusBadge
              label={typeLabel}
              variant={loyaltyLedgerTypeVariant(entry.type?.value)}
            />
            <StatusBadge
              label={`${t.loyaltyLedgerPoints}: ${formatLedgerPoints(entry.points)}`}
              variant={entry.points >= 0 ? "success" : "danger"}
            />
            <StatusBadge
              label={`${t.loyaltyLedgerBalanceAfter}: ${entry.balanceAfter}`}
              variant="info"
            />
          </div>
        </div>
      }
    />
  );
}
