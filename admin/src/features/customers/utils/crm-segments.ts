import type { CrmSegment, CrmTag } from "@/features/customers/types/customers.types";
import type { CrudFilterValues } from "@/shared/crud";

export const CRM_SEGMENTS: readonly CrmSegment[] = [
  "new_buyers",
  "repeat_buyers",
  "care_plan",
  "inactive",
  "big_spenders",
];

export const CRM_TAGS: readonly CrmTag[] = [
  "vip",
  "care_plan",
  "prescription",
  "high_value",
  "inactive",
];

export function isCrmSegment(value: string): value is CrmSegment {
  return (CRM_SEGMENTS as readonly string[]).includes(value);
}

export function isCrmTag(value: string): value is CrmTag {
  return (CRM_TAGS as readonly string[]).includes(value);
}

export function crmListFiltersFromSearch(search: string): Partial<CrudFilterValues> {
  const query = search.startsWith("?") ? search.slice(1) : search;
  const params = new URLSearchParams(query);
  const values: Partial<CrudFilterValues> = {};
  const segment = params.get("segment")?.trim() ?? "";
  const tag = params.get("tag")?.trim() ?? "";
  if (isCrmSegment(segment)) values.segment = segment;
  if (isCrmTag(tag)) values.tag = tag;
  return values;
}

export function readCrmListFiltersFromWindow(): Partial<CrudFilterValues> {
  if (typeof window === "undefined") return {};
  return crmListFiltersFromSearch(window.location.search);
}

export function applyCrmListSearchParams(
  currentSearch: string,
  patch: { segment?: string; tag?: string },
): string {
  const query = currentSearch.startsWith("?") ? currentSearch.slice(1) : currentSearch;
  const next = new URLSearchParams(query);
  if (patch.segment !== undefined) {
    if (isCrmSegment(patch.segment)) next.set("segment", patch.segment);
    else next.delete("segment");
  }
  if (patch.tag !== undefined) {
    if (isCrmTag(patch.tag)) next.set("tag", patch.tag);
    else next.delete("tag");
  }
  next.delete("id");
  return next.toString();
}

export function visibleTags(customer: { tags: CrmTag[] }): CrmTag[] {
  return customer.tags;
}
