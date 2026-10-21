import {
  createEmptyLocaleFields,
  localeFieldsFromApi,
  type LocaleFieldValues,
  pickChangedLocaleFields,
} from "@/shared/lib/api/locale-fields.utils";
import { hasFormChanges, pickChangedScalar } from "@/shared/lib/form/pick-changed-fields";
import type { PaginatedResult } from "@/shared/types";

export const DIRECTORY_ENTRY_TYPES = ["place", "coach", "team"] as const;
export type DirectoryEntryType = (typeof DIRECTORY_ENTRY_TYPES)[number];

export const DIRECTORY_ENTRY_LOCALE_FIELDS = ["name", "description"] as const;
export type DirectoryEntryLocaleField = (typeof DIRECTORY_ENTRY_LOCALE_FIELDS)[number];

export type AreaRef = { id: number; slug: string; name?: string | null };

export type DirectoryEntry = {
  id: number;
  slug: string;
  type: DirectoryEntryType;
  areaId?: number | null;
  area?: AreaRef | null;
  whatsapp?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  mapUrl?: string | null;
  verified: boolean;
  publish: boolean;
  sortOrder: number;
  name?: string | null;
  description?: string | null;
  imageFileUrl?: string | null;
  translations?: LocaleFieldValues<DirectoryEntryLocaleField>;
  createdAt?: string;
  updatedAt?: string;
};

export type DirectoryEntryListParams = {
  page?: number;
  limit?: number;
  search?: string;
  publish?: boolean;
  verified?: boolean;
  type?: string;
  areaId?: string;
  sort?: string;
  direction?: "asc" | "desc";
};

export type DirectoryEntryFormData = {
  translations: LocaleFieldValues<DirectoryEntryLocaleField>;
  slug: string;
  type: DirectoryEntryType;
  areaId: string;
  whatsapp: string;
  facebookUrl: string;
  instagramUrl: string;
  mapUrl: string;
  verified: boolean;
  publish: boolean;
  sortOrder: string;
  image: File | null;
};

export type DirectoryEntryListResult = PaginatedResult<DirectoryEntry>;

export function createEmptyDirectoryEntryForm(): DirectoryEntryFormData {
  return {
    translations: createEmptyLocaleFields(DIRECTORY_ENTRY_LOCALE_FIELDS),
    slug: "",
    type: "place",
    areaId: "",
    whatsapp: "",
    facebookUrl: "",
    instagramUrl: "",
    mapUrl: "",
    verified: false,
    publish: true,
    sortOrder: "0",
    image: null,
  };
}

export function directoryEntryToFormData(entry: DirectoryEntry): DirectoryEntryFormData {
  return {
    translations: localeFieldsFromApi(entry.translations, DIRECTORY_ENTRY_LOCALE_FIELDS),
    slug: entry.slug ?? "",
    type: entry.type,
    areaId: entry.areaId ? String(entry.areaId) : "",
    whatsapp: entry.whatsapp ?? "",
    facebookUrl: entry.facebookUrl ?? "",
    instagramUrl: entry.instagramUrl ?? "",
    mapUrl: entry.mapUrl ?? "",
    verified: entry.verified,
    publish: entry.publish,
    sortOrder: String(entry.sortOrder ?? 0),
    image: null,
  };
}

export function pickDirectoryEntryFormChanges(
  original: DirectoryEntryFormData,
  current: DirectoryEntryFormData,
): Partial<DirectoryEntryFormData> {
  const changes: Partial<DirectoryEntryFormData> = pickChangedScalar(original, current, [
    "slug",
    "type",
    "areaId",
    "whatsapp",
    "facebookUrl",
    "instagramUrl",
    "mapUrl",
    "verified",
    "publish",
    "sortOrder",
  ]);
  const translations = pickChangedLocaleFields(
    original.translations,
    current.translations,
    DIRECTORY_ENTRY_LOCALE_FIELDS,
  );
  if (translations) changes.translations = translations;
  if (current.image instanceof File) changes.image = current.image;
  return changes;
}

export function hasDirectoryEntryFormChanges(
  original: DirectoryEntryFormData,
  current: DirectoryEntryFormData,
): boolean {
  return hasFormChanges(pickDirectoryEntryFormChanges(original, current));
}
