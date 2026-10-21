import {
  hasFormChanges,
  pickChangedScalar,
} from "@/shared/lib/form/pick-changed-fields";
import type { LoyaltyTranslationsInput } from "@/shared/lib/loyalty/loyalty-translations.utils";
import {
  createEmptyLoyaltyTranslations,
  mapLoyaltyTranslationsFromApi,
} from "@/shared/lib/loyalty/loyalty-translations.utils";
import type { PaginatedResult } from "@/shared/types";

export type LoyaltyEventEnumOption = {
  label: string;
  value: string;
};

export type LoyaltyEvent = {
  id: number;
  code: string;
  name?: string | null;
  description?: string | null;
  type?: LoyaltyEventEnumOption | null;
  points: number;
  maxTimes?: number | null;
  isActive: boolean;
  conditions?: Record<string, unknown> | null;
  translations?: LoyaltyTranslationsInput;
  createdAt?: string;
  updatedAt?: string;
};

export type LoyaltyEventListParams = {
  page?: number;
  limit?: number;
  search?: string;
  code?: string;
  type?: string;
  isActive?: boolean;
  sort?: string;
  direction?: "asc" | "desc";
};

export type LoyaltyEventFormData = {
  code: string;
  type: string;
  points: number;
  maxTimes: number | null;
  isActive: boolean;
  translations: LoyaltyTranslationsInput;
};

export type LoyaltyEventListResult = PaginatedResult<LoyaltyEvent>;

export function createEmptyLoyaltyEventForm(): LoyaltyEventFormData {
  return {
    code: "",
    type: "REGISTRATION",
    points: 0,
    maxTimes: null,
    isActive: true,
    translations: createEmptyLoyaltyTranslations(),
  };
}

export function loyaltyEventToFormData(event: LoyaltyEvent): LoyaltyEventFormData {
  return {
    code: event.code ?? "",
    type: event.type?.value ?? "REGISTRATION",
    points: Number(event.points ?? 0),
    maxTimes: event.maxTimes ?? null,
    isActive: Boolean(event.isActive),
    translations: mapLoyaltyTranslationsFromApi(event.translations, event.name),
  };
}

export function pickLoyaltyEventFormChanges(
  original: LoyaltyEventFormData,
  current: LoyaltyEventFormData,
): Partial<LoyaltyEventFormData> {
  const changes: Partial<LoyaltyEventFormData> = {
    ...pickChangedScalar(original, current, [
      "code",
      "type",
      "points",
      "maxTimes",
      "isActive",
    ]),
  };

  const locales: Array<"en" | "ar"> = ["en", "ar"];
  let translationsChanged = false;
  for (const locale of locales) {
    const before = original.translations[locale];
    const after = current.translations[locale];
    if (
      (before?.name ?? "").trim() !== (after?.name ?? "").trim() ||
      (before?.description ?? "").trim() !== (after?.description ?? "").trim()
    ) {
      translationsChanged = true;
      break;
    }
  }

  if (translationsChanged) {
    changes.translations = current.translations;
  }

  return changes;
}

export function hasLoyaltyEventFormChanges(
  original: LoyaltyEventFormData,
  current: LoyaltyEventFormData,
): boolean {
  return hasFormChanges(pickLoyaltyEventFormChanges(original, current));
}
