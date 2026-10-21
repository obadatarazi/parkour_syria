import type {
  PaymentProvider,
  PaymentProviderFormData,
  PaymentProviderListParams,
  PaymentProviderListResult,
} from "@/features/payment-providers/types/payment-providers.types";
import type { BulkDeleteApiResult } from "@/shared/lib/api";

export interface PaymentProvidersService {
  list(params?: PaymentProviderListParams, signal?: AbortSignal): Promise<PaymentProviderListResult>;
  getById(id: number): Promise<PaymentProvider>;
  create(data: PaymentProviderFormData): Promise<PaymentProvider>;
  update(id: number, data: Partial<PaymentProviderFormData>): Promise<PaymentProvider>;
  delete(id: number): Promise<void>;
  bulkDelete(ids: Array<string | number>): Promise<BulkDeleteApiResult>;
}
