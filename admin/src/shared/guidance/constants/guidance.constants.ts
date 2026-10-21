export const GUIDANCE_STORAGE_VERSION = "v1";
export const GUIDANCE_STORAGE_PREFIX = `aroma-guidance:${GUIDANCE_STORAGE_VERSION}`;
export const GUIDANCE_PANEL_POS_PREFIX = "aroma-guidance-panel-pos:";

export const GUIDANCE_POPOVER_CLASS = "aroma-guidance-popover";

export function pageAnchor(pageId: string, part: string): string {
  return `${pageId}-${part}`;
}

export function createStandardAnchors(pageId: string) {
  return {
    title: pageAnchor(pageId, "title"),
    search: pageAnchor(pageId, "search"),
    filters: pageAnchor(pageId, "filters"),
    add: pageAnchor(pageId, "add"),
    rowActions: pageAnchor(pageId, "row-actions"),
    status: pageAnchor(pageId, "status"),
  } as const;
}

/** Shared anchors on every create/edit AppDrawer (products, brands, roles, …). */
export const CRUD_FORM_DRAWER_ANCHORS = {
  panel: "crud-form-drawer",
  title: "crud-form-drawer-title",
  body: "crud-form-drawer-body",
  footer: "crud-form-drawer-footer",
} as const;

/** Shared anchors inside entity forms (optional — skip if missing). */
export const CRUD_FORM_FIELD_ANCHORS = {
  visibility: "crud-form-visibility",
  actions: "crud-form-actions",
  tabs: "crud-form-tabs",
} as const;

/** Prescription create/edit workspace + view anchors. */
export const PRESCRIPTION_GUIDANCE_ANCHORS = {
  workspace: "prescriptions-form-workspace",
  sectionNav: "prescriptions-form-sections",
  customer: "prescriptions-form-customer",
  document: "prescriptions-form-document",
  review: "prescriptions-form-review",
  products: "prescriptions-form-products",
  viewWorkspace: "prescriptions-view-workspace",
} as const;

/** Care Plan create/edit workspace + view lifecycle anchors. */
export const CARE_PLAN_GUIDANCE_ANCHORS = {
  widgets: "care-plans-widgets",
  workspace: "care-plans-form-workspace",
  sectionNav: "care-plans-form-sections",
  basics: "care-plans-form-basics",
  delivery: "care-plans-form-delivery",
  items: "care-plans-form-items",
  viewWorkspace: "care-plans-view-workspace",
  lifecycle: "care-plans-lifecycle",
} as const;

/** Homepage CMS tab cluster. */
export const HOMEPAGE_GUIDANCE_ANCHORS = {
  title: "homepage-title",
  tabs: "homepage-tabs",
  preview: "homepage-preview",
} as const;

/** Coupon create/edit workspace anchors. */
export const COUPON_FORM_ANCHORS = {
  workspace: "coupon-form-workspace",
  sectionNav: "coupon-form-section-nav",
  rules: "coupon-form-rules",
  staffOnly: "coupon-form-staff-only",
} as const;

/** Order create/edit workspace — coupons & loyalty. */
export const ORDER_FORM_ANCHORS = {
  workspace: "order-form-workspace",
  sectionNav: "order-form-section-nav",
  couponsNav: "order-form-coupons-nav",
  coupons: "order-form-coupons",
  quickCoupon: "order-form-quick-coupon",
  loyalty: "order-form-loyalty",
} as const;

/** Loyalty overlay forms. */
export const LOYALTY_FORM_ANCHORS = {
  eventActive: "loyalty-event-active",
  rewardMinCart: "loyalty-reward-min-cart",
} as const;

/** Product create/edit form tab + section anchors. */
export const PRODUCT_FORM_ANCHORS = {
  workspace: "product-form-workspace",
  sectionNav: "product-form-section-nav",
  preview: "product-form-preview",
  tabGeneral: "product-tab-general",
  tabContent: "product-tab-content",
  tabSeo: "product-tab-seo",
  tabMedia: "product-tab-media",
  tabAttributes: "product-tab-attributes",
  tabVariants: "product-tab-variants",
  visibility: "product-form-visibility",
  type: "product-form-type",
  content: "product-form-content",
  seo: "product-form-seo",
  media: "product-form-media",
  attributes: "product-form-attributes",
} as const;
