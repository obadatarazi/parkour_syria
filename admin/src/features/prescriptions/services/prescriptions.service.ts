import type { PrescriptionsService } from "@/features/prescriptions/services/prescriptions.service.types";
import { createApiPrescriptionsService } from "@/features/prescriptions/services/prescriptions-api.service";

export const prescriptionsService: PrescriptionsService = createApiPrescriptionsService();
