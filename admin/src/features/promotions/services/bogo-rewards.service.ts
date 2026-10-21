import type { BogoRewardsService } from "@/features/promotions/services/bogo-rewards.service.types";
import { createApiBogoRewardsService } from "@/features/promotions/services/bogo-rewards-api.service";

export const bogoRewardsService: BogoRewardsService = createApiBogoRewardsService();
