import type { HolidaysService } from "@/features/holidays/services/holidays.service.types";
import { createApiHolidaysService } from "@/features/holidays/services/holidays-api.service";

export const holidaysService: HolidaysService = createApiHolidaysService();
