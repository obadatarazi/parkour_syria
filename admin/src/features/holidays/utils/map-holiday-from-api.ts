import type { Holiday } from "@/features/holidays/types/holidays.types";

export function mapHolidayFromApi(entity: Holiday): Holiday {
  return {
    ...entity,
    isActive: Boolean(entity.isActive),
  };
}
