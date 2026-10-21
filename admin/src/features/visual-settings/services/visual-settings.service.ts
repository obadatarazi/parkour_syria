import type { VisualSettingsService } from "@/features/visual-settings/services/visual-settings.service.types";
import { createApiVisualSettingsService } from "@/features/visual-settings/services/visual-settings-api.service";

export const visualSettingsService: VisualSettingsService = createApiVisualSettingsService();
