import type { AreaRef } from "@/features/directory-entries/types/directory-entries.types";
import {
  apiDateTimeToInput,
  type EventType,
  inputDateTimeToApi,
} from "@/features/events/types/events.types";
import type { Translation } from "@/shared/design-system/localization/locales/en";
import { hasFormChanges, pickChangedScalar } from "@/shared/lib/form/pick-changed-fields";
import type { PaginatedResult } from "@/shared/types";

export const SUGGESTION_TYPES = ["place", "coach", "team", "event"] as const;
export type SuggestionType = (typeof SUGGESTION_TYPES)[number];

export const SUGGESTION_STATUSES = ["pending", "accepted", "rejected"] as const;
export type SuggestionStatus = (typeof SUGGESTION_STATUSES)[number];

export type Suggestion = {
  id: number;
  type: SuggestionType;
  status: SuggestionStatus;
  name?: string | null;
  area?: AreaRef | null;
  description?: string | null;
  contact?: string | null;
  /** The visitor's optional photo; it is copied onto the entry or event when accepted. */
  imageFileUrl?: string | null;
  startsAt?: string | null;
  proposerName?: string | null;
  proposerContact?: string | null;
  /** Only on the details response. */
  payload?: Record<string, unknown> | null;
  safetyAccepted: boolean;
  rejectReason?: string | null;
  reviewedBy?: { id: number; fullName?: string | null } | null;
  reviewedAt?: string | null;
  promotedType?: string | null;
  promotedId?: number | null;
  createdAt?: string;
  updatedAt?: string;
};

export type SuggestionListParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
  areaId?: string;
  sort?: string;
  direction?: "asc" | "desc";
};

/** What an admin may correct on a pending suggestion before accepting it. */
export type SuggestionFormData = {
  type: SuggestionType;
  name: string;
  areaId: string;
  description: string;
  contact: string;
  startsAt: string;
  proposerName: string;
  proposerContact: string;
};

export type SuggestionAcceptData = {
  publish: boolean;
  verified: boolean;
  slug?: string;
  /** Only read for an event. */
  eventType?: EventType;
  /** Only read for an event, overrides the proposed date. `YYYY-MM-DDTHH:mm`. */
  startsAt?: string;
};

export type SuggestionListResult = PaginatedResult<Suggestion>;

export function suggestionTypeLabel(t: Translation, type: string): string {
  switch (type) {
    case "place":
      return t.directoryTypePlace;
    case "coach":
      return t.directoryTypeCoach;
    case "team":
      return t.directoryTypeTeam;
    case "event":
      return t.suggestionTypeEvent;
    default:
      return type;
  }
}

export function suggestionStatusLabel(t: Translation, status: string): string {
  switch (status) {
    case "pending":
      return t.suggestionStatusPending;
    case "accepted":
      return t.suggestionStatusAccepted;
    case "rejected":
      return t.suggestionStatusRejected;
    default:
      return status;
  }
}

export function suggestionStatusVariant(status: string): "warning" | "success" | "danger" {
  if (status === "accepted") return "success";
  if (status === "rejected") return "danger";
  return "warning";
}

export function suggestionToFormData(suggestion: Suggestion): SuggestionFormData {
  return {
    type: suggestion.type,
    name: suggestion.name ?? "",
    areaId: suggestion.area?.id ? String(suggestion.area.id) : "",
    description: suggestion.description ?? "",
    contact: suggestion.contact ?? "",
    startsAt: apiDateTimeToInput(suggestion.startsAt),
    proposerName: suggestion.proposerName ?? "",
    proposerContact: suggestion.proposerContact ?? "",
  };
}

export function pickSuggestionFormChanges(
  original: SuggestionFormData,
  current: SuggestionFormData,
): Partial<SuggestionFormData> {
  return pickChangedScalar(original, current, [
    "type",
    "name",
    "areaId",
    "description",
    "contact",
    "startsAt",
    "proposerName",
    "proposerContact",
  ]);
}

export function hasSuggestionFormChanges(
  original: SuggestionFormData,
  current: SuggestionFormData,
): boolean {
  return hasFormChanges(pickSuggestionFormChanges(original, current));
}

/** The JSON body of `PUT /admin/suggestions/{id}`. Cleared fields are sent as null. */
export function suggestionFormToApi(data: Partial<SuggestionFormData>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  const text = (value: string) => (value.trim() ? value.trim() : null);
  if (data.type !== undefined) body.type = data.type;
  if (data.name !== undefined) body.name = text(data.name);
  if (data.areaId !== undefined) body.area_id = data.areaId ? Number(data.areaId) : null;
  if (data.description !== undefined) body.description = text(data.description);
  if (data.contact !== undefined) body.contact = text(data.contact);
  if (data.startsAt !== undefined) {
    body.starts_at = data.startsAt ? inputDateTimeToApi(data.startsAt) : null;
  }
  if (data.proposerName !== undefined) body.proposer_name = text(data.proposerName);
  if (data.proposerContact !== undefined) body.proposer_contact = text(data.proposerContact);
  return body;
}

export function suggestionAcceptToApi(data: SuggestionAcceptData): Record<string, unknown> {
  const body: Record<string, unknown> = { publish: data.publish, verified: data.verified };
  if (data.slug?.trim()) body.slug = data.slug.trim();
  if (data.eventType) body.event_type = data.eventType;
  if (data.startsAt) body.starts_at = inputDateTimeToApi(data.startsAt);
  return body;
}
