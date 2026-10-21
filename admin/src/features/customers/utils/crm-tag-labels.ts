import type { CrmTag } from "@/features/customers/types/customers.types";

export const CRM_TAG_LABEL_KEYS: Record<CrmTag, string> = {
  vip: "crmTagVip",
  care_plan: "crmTagCarePlan",
  prescription: "crmTagPrescription",
  high_value: "crmTagHighValue",
  inactive: "crmTagInactive",
};

export function visibleTags(tags: CrmTag[]): CrmTag[] {
  return tags.filter((tag) => tag !== "inactive" || tags.includes("inactive"));
}
