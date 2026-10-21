import { CRUD_FORM_FIELD_ANCHORS } from "@/shared/guidance/constants/guidance.constants";
import { ORDER_FORM_ANCHORS } from "@/shared/guidance/constants/guidance.constants";
import type { TourStepDef } from "@/shared/guidance/types/guidance.types";

export function ordersFormTour(): TourStepDef[] {
  return [
    {
      id: "order-form-workspace",
      anchor: ORDER_FORM_ANCHORS.workspace,
      title: "Order workspace",
      description:
        "Create the order from the sections on the left: source, items, coupons, customer, then delivery.",
      side: "bottom",
      align: "start",
      skipIfMissing: true,
    },
    {
      id: "order-form-coupons-nav",
      anchor: ORDER_FORM_ANCHORS.couponsNav,
      title: "Coupons section",
      description:
        "Open Coupons to apply a promo code. Loyalty discounts are not coupons — they appear on the order after checkout if the customer redeemed points.",
      side: "right",
      align: "start",
      clickToActivate: true,
      skipIfMissing: true,
    },
    {
      id: "order-form-quick-coupon",
      anchor: ORDER_FORM_ANCHORS.quickCoupon,
      title: "Quick coupon",
      description:
        "Create a one-off cart discount or free shipping without leaving this page. Staff-only is on by default so the code cannot be used on the website.",
      side: "left",
      align: "start",
      waitForElement: 2500,
      skipIfMissing: true,
    },
    {
      id: "form-actions",
      anchor: CRUD_FORM_FIELD_ANCHORS.actions,
      title: "Save order",
      description: "Coupons attach only when you create the order. Save when items, customer, and delivery are complete.",
      side: "top",
      align: "end",
      skipIfMissing: true,
    },
  ];
}
