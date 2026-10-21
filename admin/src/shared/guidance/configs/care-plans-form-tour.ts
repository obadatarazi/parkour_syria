import {
  CARE_PLAN_GUIDANCE_ANCHORS,
  CRUD_FORM_FIELD_ANCHORS,
} from "@/shared/guidance/constants/guidance.constants";
import type { TourStepDef } from "@/shared/guidance/types/guidance.types";

/** Short create/edit tour for the care-plan workspace page. */
export function carePlansFormTour(): TourStepDef[] {
  return [
    {
      id: "care-plan-workspace",
      anchor: CARE_PLAN_GUIDANCE_ANCHORS.workspace,
      title: "Care Plan workspace",
      description:
        "This full page is for creating and editing a Subscribe & Save plan. Use the section list to move between Basics, Delivery, and Items.",
      side: "bottom",
      align: "start",
      skipIfMissing: true,
    },
    {
      id: "care-plan-basics",
      anchor: CARE_PLAN_GUIDANCE_ANCHORS.basics,
      title: "Customer & schedule",
      description:
        "Pick the customer, delivery address, payment method, and how often the plan should renew.",
      side: "left",
      align: "start",
      skipIfMissing: true,
    },
    {
      id: "care-plan-sections",
      anchor: CARE_PLAN_GUIDANCE_ANCHORS.sectionNav,
      title: "Plan sections",
      description:
        "Switch between Basics, Delivery, and Items. Open Items to add products that are approved for Care Plan.",
      side: "right",
      align: "start",
      skipIfMissing: true,
    },
    {
      id: "care-plan-save",
      anchor: CRUD_FORM_FIELD_ANCHORS.actions,
      title: "Save care plan",
      description: "Save when the customer, schedule, and items are complete.",
      side: "top",
      align: "end",
      skipIfMissing: true,
    },
  ];
}
