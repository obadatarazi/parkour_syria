import type {
  LoyaltyEvent,
  LoyaltyEventFormData,
  LoyaltyEventListParams,
} from "@/features/loyalty-events/types/loyalty-events.types";
import type { BulkDeleteApiResult } from "@/shared/lib/api";
import type { PaginatedResult } from "@/shared/types";

export type LoyaltyEventsService = {
  list: (
    params?: LoyaltyEventListParams,
    signal?: AbortSignal,
  ) => Promise<PaginatedResult<LoyaltyEvent>>;
  getById: (id: number, signal?: AbortSignal) => Promise<LoyaltyEvent>;
  create: (data: LoyaltyEventFormData) => Promise<LoyaltyEvent>;
  update: (id: number, data: Partial<LoyaltyEventFormData>) => Promise<LoyaltyEvent>;
  delete: (id: number) => Promise<void>;
  bulkDelete: (ids: Array<string | number>) => Promise<BulkDeleteApiResult>;
};
