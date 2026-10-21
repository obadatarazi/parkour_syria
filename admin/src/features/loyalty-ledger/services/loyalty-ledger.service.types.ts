import type {
  LoyaltyLedgerEntry,
  LoyaltyLedgerListParams,
  LoyaltyLedgerListResult,
} from "@/features/loyalty-ledger/types/loyalty-ledger.types";

export interface LoyaltyLedgerService {
  list(params?: LoyaltyLedgerListParams, signal?: AbortSignal): Promise<LoyaltyLedgerListResult>;
  getById(id: number, signal?: AbortSignal): Promise<LoyaltyLedgerEntry>;
}
