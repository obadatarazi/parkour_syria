import type { BogoConditionsService } from "@/features/promotions/services/bogo-conditions.service.types";
import { createApiBogoConditionsService } from "@/features/promotions/services/bogo-conditions-api.service";

export const bogoConditionsService: BogoConditionsService = createApiBogoConditionsService();
