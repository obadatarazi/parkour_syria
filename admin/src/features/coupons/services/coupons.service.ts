import { createApiCouponsService } from "@/features/coupons/services/coupons-api.service";
import type { CouponsService } from "@/features/coupons/services/coupons.service.types";

export const couponsService: CouponsService = createApiCouponsService();
