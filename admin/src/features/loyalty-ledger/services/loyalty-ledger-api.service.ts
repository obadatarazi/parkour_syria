import type { LoyaltyLedgerService } from "@/features/loyalty-ledger/services/loyalty-ledger.service.types";
import type {
  LoyaltyLedgerEntry,
  LoyaltyLedgerListParams,
} from "@/features/loyalty-ledger/types/loyalty-ledger.types";
import { mapLoyaltyLedgerEntryFromApi } from "@/features/loyalty-ledger/utils/map-loyalty-ledger-from-api";
import {
  apiRequest,
  buildLaravelListParams,
  type LaravelPaginatedResponse,
  type LaravelSuccessResponse,
  mapPaginatedFromApi,
} from "@/shared/lib/api";

function createApiLoyaltyLedgerService(): LoyaltyLedgerService {
  return {
    async list(params: LoyaltyLedgerListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<LaravelPaginatedResponse<LoyaltyLedgerEntry>>(
        "/admin/loyalty-ledger",
        {
          signal,
          params: buildLaravelListParams(
            {
              page: params.page,
              limit: params.limit,
              search: params.search,
              type: params.type,
              userId: params.userId,
              loyaltyEventId: params.loyaltyEventId,
              loyaltyRewardId: params.loyaltyRewardId,
              orderId: params.orderId,
              sort: params.sort,
              direction: params.direction,
            },
            { limit: 20 },
          ),
        },
      );
      return mapPaginatedFromApi(response, mapLoyaltyLedgerEntryFromApi);
    },

    async getById(id, signal?: AbortSignal) {
      const response = await apiRequest<LaravelSuccessResponse<LoyaltyLedgerEntry>>(
        `/admin/loyalty-ledger/${id}`,
        { signal },
      );
      return mapLoyaltyLedgerEntryFromApi(response.data);
    },
  };
}

export { createApiLoyaltyLedgerService };
