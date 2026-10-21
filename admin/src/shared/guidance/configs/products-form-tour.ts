import { defaultFormTour } from "@/shared/guidance/configs/create-crud-guidance";
import { CRUD_FORM_FIELD_ANCHORS, PRODUCT_FORM_ANCHORS } from "@/shared/guidance/constants/guidance.constants";
import type { TourStepDef } from "@/shared/guidance/types/guidance.types";

/** Short create/edit tour for the product workspace page. */
export function productsFormTour(): TourStepDef[] {
  return [
    {
      id: "form-workspace",
      anchor: PRODUCT_FORM_ANCHORS.workspace,
      title: "Product workspace",
      description:
        "This full page is for adding and editing products. Use the section list to move between General, Media, Pricing, and SEO.",
      side: "bottom",
      align: "start",
      skipIfMissing: true,
    },
    {
      id: "product-content",
      anchor: PRODUCT_FORM_ANCHORS.content,
      title: "Titles & catalog",
      description: "Name the product, then pick brand and categories. Tags are optional.",
      side: "left",
      align: "start",
      skipIfMissing: true,
    },
    {
      id: "product-visibility",
      anchor: PRODUCT_FORM_ANCHORS.visibility,
      title: "Publish",
      description: "Turn Publish on to show the product on the storefront when you are ready.",
      side: "left",
      align: "start",
      skipIfMissing: true,
    },
    {
      id: "form-actions",
      anchor: CRUD_FORM_FIELD_ANCHORS.actions,
      title: "Save product",
      description: "Complete SKU, price, and stock under Attributes, then save.",
      side: "top",
      align: "end",
      skipIfMissing: true,
    },
  ];
}

/** Brands / categories keep the shared drawer tour (includes visibility + save). */
export function standardEntityFormTour(): TourStepDef[] {
  return defaultFormTour();
}
