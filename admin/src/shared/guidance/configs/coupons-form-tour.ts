import { CRUD_FORM_FIELD_ANCHORS } from "@/shared/guidance/constants/guidance.constants";
import { COUPON_FORM_ANCHORS } from "@/shared/guidance/constants/guidance.constants";
import type { TourStepDef } from "@/shared/guidance/types/guidance.types";

export function couponsFormTour(): TourStepDef[] {
  return [
    {
      id: "coupon-form-workspace",
      anchor: COUPON_FORM_ANCHORS.workspace,
      title: "Coupon workspace",
      description:
        "Build a promo code here. Coupons are not loyalty rewards — loyalty points buy a reward, then a redemption is applied at checkout.",
      side: "bottom",
      align: "start",
      skipIfMissing: true,
    },
    {
      id: "coupon-form-rules",
      anchor: COUPON_FORM_ANCHORS.rules,
      title: "Audience & staff-only",
      description:
        "Open Rules to choose who can use the code. Staff-only codes work on admin orders and are rejected on the website.",
      side: "right",
      align: "start",
      clickToActivate: true,
      skipIfMissing: true,
    },
    {
      id: "coupon-form-staff-only",
      anchor: COUPON_FORM_ANCHORS.staffOnly,
      title: "Staff-only coupon",
      description:
        "Turn this on for internal discounts. Customers cannot apply the code on the storefront.",
      side: "left",
      align: "start",
      waitForElement: 2500,
      skipIfMissing: true,
    },
    {
      id: "form-actions",
      anchor: CRUD_FORM_FIELD_ANCHORS.actions,
      title: "Save coupon",
      description: "Save when the code, type, and rules are complete. Use Help anytime to replay this tour.",
      side: "top",
      align: "end",
      skipIfMissing: true,
    },
  ];
}
