import type { CarePlansService } from "@/features/care-plans/services/care-plans.service.types";
import { createApiCarePlansService } from "@/features/care-plans/services/care-plans-api.service";

export const carePlansService: CarePlansService = createApiCarePlansService();
