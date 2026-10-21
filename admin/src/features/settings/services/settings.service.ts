import type { SettingsService } from "@/features/settings/services/settings.service.types";
import { createApiSettingsService } from "@/features/settings/services/settings-api.service";

export const settingsService: SettingsService = createApiSettingsService();
