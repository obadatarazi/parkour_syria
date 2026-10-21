import type { StatesService } from "@/features/states/services/states.service.types";
import { createApiStatesService } from "@/features/states/services/states-api.service";

export const statesService: StatesService = createApiStatesService();
