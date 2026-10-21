import type { DeliveryZonesPrice } from "@/features/delivery-zones-prices/types/delivery-zones-prices.types";
import { mapTranslatableFromApi } from "@/shared/lib/api";

export function mapDeliveryZonesPriceFromApi(
  entity: DeliveryZonesPrice,
): DeliveryZonesPrice {
  return {
    ...entity,
    deliveryFee: Number(entity.deliveryFee),
    publish: Boolean(entity.publish),
    state: entity.state ? mapTranslatableFromApi(entity.state) : entity.state,
  };
}
