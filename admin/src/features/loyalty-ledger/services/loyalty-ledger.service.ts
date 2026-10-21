import type { LoyaltyLedgerService } from "@/features/loyalty-ledger/services/loyalty-ledger.service.types";
import { createApiLoyaltyLedgerService } from "@/features/loyalty-ledger/services/loyalty-ledger-api.service";

export const loyaltyLedgerService: LoyaltyLedgerService = createApiLoyaltyLedgerService();
