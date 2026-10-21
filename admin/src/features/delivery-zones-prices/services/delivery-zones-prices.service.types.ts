import type {
  DeliveryZonesPrice,
  DeliveryZonesPriceFormData,
  DeliveryZonesPriceListParams,
  DeliveryZonesPriceListResult,
} from "@/features/delivery-zones-prices/types/delivery-zones-prices.types";
import type { BulkDeleteApiResult } from "@/shared/lib/api";

export interface DeliveryZonesPricesService {
  list(params?: DeliveryZonesPriceListParams, signal?: AbortSignal): Promise<DeliveryZonesPriceListResult>;
  getById(id: number, signal?: AbortSignal): Promise<DeliveryZonesPrice>;
  create(data: DeliveryZonesPriceFormData): Promise<DeliveryZonesPrice>;
  update(id: number, data: Partial<DeliveryZonesPriceFormData>): Promise<DeliveryZonesPrice>;
  delete(id: number): Promise<void>;
  bulkDelete(ids: Array<string | number>): Promise<BulkDeleteApiResult>;
}
