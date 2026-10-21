import type {
  Coupon,
  CouponFormData,
  CouponListParams,
  CouponListResult,
} from "@/features/coupons/types/coupons.types";
import type { BulkDeleteApiResult } from "@/shared/lib/api";

export interface CouponsService {
  list(params?: CouponListParams, signal?: AbortSignal): Promise<CouponListResult>;
  getById(id: number, signal?: AbortSignal): Promise<Coupon>;
  /** View lookup: coupon code uses the list filter (light); numeric id uses show. */
  getByCodeOrId(idOrCode: number | string, signal?: AbortSignal): Promise<Coupon>;
  resolveRouteKey(routeKey: string, signal?: AbortSignal): Promise<Coupon>;
  create(data: CouponFormData): Promise<Coupon>;
  update(id: number, data: Partial<CouponFormData>): Promise<Coupon>;
  delete(id: number): Promise<void>;
  bulkDelete(ids: Array<string | number>): Promise<BulkDeleteApiResult>;
}
