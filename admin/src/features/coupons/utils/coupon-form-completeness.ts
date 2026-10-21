import type { CouponFormData } from "@/features/coupons/types/coupons.types";

export type CouponFormSectionId = "offer" | "audience" | "schedule" | "appliesTo";

export type CouponCompletenessItem = {
  id: string;
  section: CouponFormSectionId;
  done: boolean;
};

export function getCouponFormCompleteness(form: CouponFormData): CouponCompletenessItem[] {
  const hasTitles = Boolean(
    form.translations.en?.title?.trim() && form.translations.ar?.title?.trim(),
  );
  const hasCode = Boolean(form.code.trim());
  const isShipping = form.scope === "SHIPPING" || form.type === "FREE_SHIPPING";
  const hasValue =
    isShipping ||
    (Boolean(form.value.trim()) && Number.isFinite(Number(form.value)) && Number(form.value) > 0);
  const hasAudience =
    form.audience !== "SPECIFIC_USERS" ||
    (form.users.length > 0 && form.users.every((user) => user.userId != null));

  const catalogKeys = form.applicableTo.filter((item) => item !== "USER");
  const itemsDoneApplies =
    form.scope !== "ITEMS"
      ? true
      : catalogKeys.length > 0 &&
        (!catalogKeys.includes("PRODUCT") ||
          form.productIds.length > 0 ||
          form.productVariantIds.length > 0) &&
        (!catalogKeys.includes("BRAND") || form.brandIds.length > 0) &&
        (!catalogKeys.includes("CATEGORY") || form.categoryIds.length > 0) &&
        (!catalogKeys.includes("TAG") || form.tagIds.length > 0);

  return [
    { id: "code", section: "offer", done: hasCode },
    { id: "titles", section: "offer", done: hasTitles },
    { id: "value", section: "offer", done: hasValue },
    { id: "audience", section: "audience", done: hasAudience },
    { id: "appliesTo", section: "appliesTo", done: itemsDoneApplies },
  ];
}

export function formatCouponOfferOneLiner(
  form: CouponFormData,
  labels: { freeShipping: string; percentOff: string; fixedOff: string; empty: string },
): string {
  if (form.scope === "SHIPPING" || form.type === "FREE_SHIPPING") {
    return labels.freeShipping;
  }
  const raw = form.value.trim();
  if (!raw) return labels.empty;
  if (form.type === "PERCENTAGE") return labels.percentOff.replace("{value}", raw);
  return labels.fixedOff.replace("{value}", raw);
}
