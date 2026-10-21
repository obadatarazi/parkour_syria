import { hasFormChanges, pickChangedScalar } from "@/shared/lib/form/pick-changed-fields";
import type { PaginatedResult } from "@/shared/types";

export type Holiday = {
  id: number;
  date: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type HolidayListParams = {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  date?: string;
  fromDate?: string;
  toDate?: string;
  sort?: string;
  direction?: "asc" | "desc";
};

export type HolidayFormData = {
  date: string | null;
  name: string;
  description?: string | null;
  isActive?: boolean;
};

export type HolidayListResult = PaginatedResult<Holiday>;

export function createEmptyHolidayForm(): HolidayFormData {
  return {
    date: null,
    name: "",
    description: null,
    isActive: true,
  };
}

export function holidayToFormData(entity: Holiday): HolidayFormData {
  return {
    date: entity.date,
    name: entity.name,
    description: entity.description ?? null,
    isActive: entity.isActive,
  };
}

export function pickHolidayFormChanges(
  original: HolidayFormData,
  current: HolidayFormData,
): Partial<HolidayFormData> {
  return pickChangedScalar(original, current, ["date", "name", "description", "isActive"]);
}

export function hasHolidayFormChanges(
  original: HolidayFormData,
  current: HolidayFormData,
): boolean {
  return hasFormChanges(pickHolidayFormChanges(original, current));
}
