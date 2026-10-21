import { EVENT_TYPES, type EventType } from "@/features/events/types/events.types";
import type { Translation } from "@/shared/design-system/localization/locales/en";
import { intlLocale } from "@/shared/lib/datetime.utils";

export function eventTypeLabel(t: Translation, type: EventType | string): string {
  switch (type) {
    case "workshop":
      return t.eventTypeWorkshop;
    case "gathering":
      return t.eventTypeGathering;
    default:
      return type;
  }
}

export function eventTypeOptions(t: Translation) {
  return EVENT_TYPES.map((value) => ({ value, label: eventTypeLabel(t, value) }));
}

/** `2026-11-02 18:30:00` in the dashboard's language. */
export function formatEventDateTime(value: string, language: "ar" | "en"): string {
  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(intlLocale(language, "en-GB"), {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
