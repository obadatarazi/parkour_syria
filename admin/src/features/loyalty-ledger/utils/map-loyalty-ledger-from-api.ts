import { mapLoyaltyEventFromApi } from "@/features/loyalty-events/utils/map-loyalty-event-from-api";
import type { LoyaltyLedgerEntry } from "@/features/loyalty-ledger/types/loyalty-ledger.types";
import { mapLoyaltyRewardFromApi } from "@/features/loyalty-rewards/utils/map-loyalty-reward-from-api";
import { mapLoyaltyEnumOption } from "@/shared/lib/loyalty/map-loyalty-enum.utils";

export function mapLoyaltyLedgerEntryFromApi(entry: LoyaltyLedgerEntry): LoyaltyLedgerEntry {
  const raw = entry as LoyaltyLedgerEntry & Record<string, unknown>;

  return {
    ...entry,
    points: Number(entry.points ?? 0),
    balanceAfter: Number(entry.balanceAfter ?? raw.balance_after ?? 0),
    userId:
      entry.userId == null && raw.user_id == null
        ? null
        : Number(entry.userId ?? raw.user_id ?? 0) || null,
    loyaltyAccountId:
      entry.loyaltyAccountId == null && raw.loyalty_account_id == null
        ? null
        : Number(entry.loyaltyAccountId ?? raw.loyalty_account_id ?? 0) || null,
    referenceType: entry.referenceType ?? (raw.reference_type as string | null | undefined) ?? null,
    referenceId:
      entry.referenceId == null && raw.reference_id == null
        ? null
        : Number(entry.referenceId ?? raw.reference_id ?? 0) || null,
    type: mapLoyaltyEnumOption(entry.type),
    user: entry.user ?? null,
    loyaltyEvent: entry.loyaltyEvent ? mapLoyaltyEventFromApi(entry.loyaltyEvent) : null,
    loyaltyReward: entry.loyaltyReward ? mapLoyaltyRewardFromApi(entry.loyaltyReward) : null,
    order: entry.order
      ? {
          id: entry.order.id,
          orderRefNumber:
            entry.order.orderRefNumber ??
            (entry.order as LoyaltyLedgerEntry["order"] & { order_ref_number?: string })
              .order_ref_number ??
            null,
        }
      : null,
  };
}

export function loyaltyLedgerTypeVariant(
  value?: string | null,
): "success" | "warning" | "danger" | "info" | "neutral" {
  switch (value) {
    case "EARN":
      return "success";
    case "REDEEM":
      return "warning";
    case "ADJUST":
      return "info";
    default:
      return "neutral";
  }
}

export function formatLedgerPoints(points: number): string {
  if (points > 0) return `+${points}`;
  return String(points);
}
