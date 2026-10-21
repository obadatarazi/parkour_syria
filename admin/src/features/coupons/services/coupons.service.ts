import type { CouponsService } from "@/features/coupons/services/coupons.service.types";
import { createApiCouponsService } from "@/features/coupons/services/coupons-api.service";

export const couponsService: CouponsService = createApiCouponsService();
