import type { OrderPartyDisplay } from "@/features/orders/utils/order-customer-display";
import { orderCreatedByBadge } from "@/features/orders/utils/order-customer-display";
import { StatusBadge } from "@/shared/components";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type OrderCreatedByCellProps = {
  party: OrderPartyDisplay;
};

/** Standalone Created by: Guest / Customer / Admin (+ admin name when Admin). */
export function OrderCreatedByCell({ party }: OrderCreatedByCellProps) {
  const t = useTranslation();
  const badge = orderCreatedByBadge(party, {
    admin: t.adminUserType,
    customer: t.customerUserType,
    guest: t.guest,
  });
  const adminName = party.createdByAdmin?.fullName?.trim();
  const adminEmail = party.createdByAdmin?.email?.trim();

  return (
    <div className="min-w-0 max-w-full">
      <StatusBadge label={badge.label} variant={badge.variant} className="max-w-full truncate" />
      {adminName ? (
        <div className="mt-1 min-w-0">
          <p className="truncate text-sm font-medium text-foreground" title={adminName}>
            {adminName}
          </p>
          {adminEmail ? (
            <p className="truncate text-xs text-muted-foreground" title={adminEmail}>
              {adminEmail}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
