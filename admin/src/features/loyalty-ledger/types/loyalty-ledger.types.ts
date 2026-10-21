import type { LoyaltyEvent } from "@/features/loyalty-events/types/loyalty-events.types";
import type { LoyaltyReward } from "@/features/loyalty-rewards/types/loyalty-rewards.types";
import type { OrderUserRef } from "@/features/orders/types/orders.types";
import type { PaginatedResult } from "@/shared/types";

export type LoyaltyLedgerEnumOption = {
  label: string;
  value: string;
};

export type LoyaltyLedgerOrderRef = {
  id: number;
  orderRefNumber?: string | null;
};

export type LoyaltyLedgerEntry = {
  id: number;
  type?: LoyaltyLedgerEnumOption | null;
  points: number;
  balanceAfter: number;
  note?: string | null;
  referenceType?: string | null;
  referenceId?: number | null;
  userId?: number | null;
  user?: OrderUserRef | null;
  loyaltyAccountId?: number | null;
  loyaltyEvent?: LoyaltyEvent | null;
  loyaltyReward?: LoyaltyReward | null;
  order?: LoyaltyLedgerOrderRef | null;
  createdAt?: string;
  updatedAt?: string;
};

export type LoyaltyLedgerListParams = {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  userId?: number;
  loyaltyEventId?: number;
  loyaltyRewardId?: number;
  orderId?: number;
  sort?: string;
  direction?: "asc" | "desc";
};

export type LoyaltyLedgerListResult = PaginatedResult<LoyaltyLedgerEntry>;
