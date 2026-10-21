import type { AreasService } from "@/features/areas/services/areas.service.types";
import { createApiAreasService } from "@/features/areas/services/areas-api.service";

export const areasService: AreasService = createApiAreasService();
