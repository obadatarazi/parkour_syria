import type { DeliveryZonesPricesService } from "@/features/delivery-zones-prices/services/delivery-zones-prices.service.types";
import { createApiDeliveryZonesPricesService } from "@/features/delivery-zones-prices/services/delivery-zones-prices-api.service";

export const deliveryZonesPricesService: DeliveryZonesPricesService =
  createApiDeliveryZonesPricesService();
