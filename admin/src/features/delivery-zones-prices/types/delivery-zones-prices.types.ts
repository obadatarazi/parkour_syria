import { hasFormChanges, pickChangedScalar } from "@/shared/lib/form/pick-changed-fields";
import type { PaginatedResult } from "@/shared/types";

export type DeliveryZonesPriceStateRef = {
  id: number;
  title: string;
  translations?: Partial<Record<"en" | "ar", { title: string }>>;
};

export type DeliveryZonesPrice = {
  id: number;
  deliveryFee: number;
  publish: boolean;
  state?: DeliveryZonesPriceStateRef | null;
  createdAt?: string;
  updatedAt?: string;
};

export type DeliveryZonesPriceListParams = {
  page?: number;
  limit?: number;
  search?: string;
  publish?: boolean;
  stateId?: number;
  sort?: string;
  direction?: "asc" | "desc";
};

export type DeliveryZonesPriceFormData = {
  stateId: number | null;
  deliveryFee: number | null;
  publish?: boolean;
};

export type DeliveryZonesPriceListResult = PaginatedResult<DeliveryZonesPrice>;

export function createEmptyDeliveryZonesPriceForm(): DeliveryZonesPriceFormData {
  return {
    stateId: null,
    deliveryFee: null,
    publish: true,
  };
}

export function deliveryZonesPriceToFormData(
  entity: DeliveryZonesPrice,
): DeliveryZonesPriceFormData {
  return {
    stateId: entity.state?.id ?? null,
    deliveryFee: entity.deliveryFee,
    publish: entity.publish,
  };
}

export function pickDeliveryZonesPriceFormChanges(
  original: DeliveryZonesPriceFormData,
  current: DeliveryZonesPriceFormData,
): Partial<DeliveryZonesPriceFormData> {
  return pickChangedScalar(original, current, ["stateId", "deliveryFee", "publish"]);
}

export function hasDeliveryZonesPriceFormChanges(
  original: DeliveryZonesPriceFormData,
  current: DeliveryZonesPriceFormData,
): boolean {
  return hasFormChanges(pickDeliveryZonesPriceFormChanges(original, current));
}
