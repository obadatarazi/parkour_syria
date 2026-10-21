import { createApiCarePlansService } from "@/features/care-plans/services/care-plans-api.service";
import type { CarePlansService } from "@/features/care-plans/services/care-plans.service.types";

export const carePlansService: CarePlansService = createApiCarePlansService();
