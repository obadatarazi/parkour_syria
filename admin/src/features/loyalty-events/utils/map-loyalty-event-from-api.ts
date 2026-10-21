import type { LoyaltyEvent } from "@/features/loyalty-events/types/loyalty-events.types";
import { mapLoyaltyEnumOption } from "@/shared/lib/loyalty/map-loyalty-enum.utils";
import { mapLoyaltyTranslationsFromApi } from "@/shared/lib/loyalty/loyalty-translations.utils";

function firstBoolean(...values: unknown[]): boolean {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    if (value === true || value === 1 || value === "1" || value === "true") return true;
    if (value === false || value === 0 || value === "0" || value === "false" || value === "") {
      return false;
    }
    return Boolean(value);
  }
  return false;
}

export function mapLoyaltyEventFromApi(event: LoyaltyEvent): LoyaltyEvent {
  const raw = event as LoyaltyEvent & Record<string, unknown>;

  return {
    ...event,
    code: String(event.code ?? ""),
    name: event.name ?? null,
    description: event.description ?? null,
    points: Number(event.points ?? 0),
    maxTimes: event.maxTimes == null ? null : Number(event.maxTimes),
    isActive: firstBoolean(raw.isActive, raw.is_active),
    type: mapLoyaltyEnumOption(event.type),
    conditions:
      event.conditions && typeof event.conditions === "object" ? event.conditions : null,
    translations: mapLoyaltyTranslationsFromApi(
      event.translations as Record<string, unknown> | undefined,
      event.name,
    ),
  };
}
