import type { AreaRef } from "@/features/directory-entries/types/directory-entries.types";
import {
  createEmptyLocaleFields,
  localeFieldsFromApi,
  type LocaleFieldValues,
  pickChangedLocaleFields,
} from "@/shared/lib/api/locale-fields.utils";
import { hasFormChanges, pickChangedScalar } from "@/shared/lib/form/pick-changed-fields";
import type { PaginatedResult } from "@/shared/types";

export const EVENT_TYPES = ["workshop", "gathering"] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const EVENT_LOCALE_FIELDS = ["title", "location_label", "description"] as const;
export type EventLocaleField = (typeof EVENT_LOCALE_FIELDS)[number];

export type ParkourEvent = {
  id: number;
  slug: string;
  type: EventType;
  /** `Y-m-d H:i:s` in the backend's timezone. */
  startsAt: string;
  areaId?: number | null;
  area?: AreaRef | null;
  contact?: string | null;
  publish: boolean;
  title?: string | null;
  locationLabel?: string | null;
  imageFileUrl?: string | null;
  translations?: LocaleFieldValues<EventLocaleField>;
  createdAt?: string;
  updatedAt?: string;
};

export type EventListParams = {
  page?: number;
  limit?: number;
  search?: string;
  publish?: boolean;
  upcoming?: boolean;
  type?: string;
  areaId?: string;
  sort?: string;
  direction?: "asc" | "desc";
};

export type EventFormData = {
  translations: LocaleFieldValues<EventLocaleField>;
  slug: string;
  type: EventType;
  /** `YYYY-MM-DDTHH:mm`, the value a datetime-local input holds. */
  startsAt: string;
  areaId: string;
  contact: string;
  publish: boolean;
  image: File | null;
};

export type EventListResult = PaginatedResult<ParkourEvent>;

/** `2026-11-02 18:30:00` → `2026-11-02T18:30`. */
export function apiDateTimeToInput(value?: string | null): string {
  if (!value) return "";
  return value.replace(" ", "T").slice(0, 16);
}

/** `2026-11-02T18:30` → `2026-11-02 18:30:00`. */
export function inputDateTimeToApi(value: string): string {
  if (!value) return "";
  return `${value.replace("T", " ")}:00`;
}

export function isPastEvent(event: Pick<ParkourEvent, "startsAt">, now = new Date()): boolean {
  const startsAt = new Date(apiDateTimeToInput(event.startsAt));
  return !Number.isNaN(startsAt.getTime()) && startsAt < now;
}

export function createEmptyEventForm(): EventFormData {
  return {
    translations: createEmptyLocaleFields(EVENT_LOCALE_FIELDS),
    slug: "",
    type: "workshop",
    startsAt: "",
    areaId: "",
    contact: "",
    publish: true,
    image: null,
  };
}

export function eventToFormData(event: ParkourEvent): EventFormData {
  return {
    translations: localeFieldsFromApi(event.translations, EVENT_LOCALE_FIELDS),
    slug: event.slug ?? "",
    type: event.type,
    startsAt: apiDateTimeToInput(event.startsAt),
    areaId: event.areaId ? String(event.areaId) : "",
    contact: event.contact ?? "",
    publish: event.publish,
    image: null,
  };
}

export function pickEventFormChanges(
  original: EventFormData,
  current: EventFormData,
): Partial<EventFormData> {
  const changes: Partial<EventFormData> = pickChangedScalar(original, current, [
    "slug",
    "type",
    "startsAt",
    "areaId",
    "contact",
    "publish",
  ]);
  const translations = pickChangedLocaleFields(
    original.translations,
    current.translations,
    EVENT_LOCALE_FIELDS,
  );
  if (translations) changes.translations = translations;
  if (current.image instanceof File) changes.image = current.image;
  return changes;
}

export function hasEventFormChanges(original: EventFormData, current: EventFormData): boolean {
  return hasFormChanges(pickEventFormChanges(original, current));
}
