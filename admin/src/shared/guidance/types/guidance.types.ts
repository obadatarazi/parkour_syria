export type GuidancePageId =
  | "dashboard"
  | "orders"
  | "invoices"
  | "order-items"
  | "products"
  | "product-reviews"
  | "categories"
  | "brands"
  | "countries"
  | "states"
  | "currencies"
  | "payment-providers"
  | "delivery-zones-prices"
  | "holidays"
  | "tags"
  | "attributes"
  | "attribute-values"
  | "customers"
  | "users"
  | "profile"
  | "prescriptions"
  | "inventory"
  | "promotions"
  | "promotion-usages"
  | "sliders"
  | "slider-promotions"
  | "static-promotions"
  | "coupons"
  | "loyalty-events"
  | "loyalty-rewards"
  | "loyalty-redemptions"
  | "loyalty-ledger"
  | "care-plans"
  | "trending-searches"
  | "homepage"
  | "notifications"
  | "whatsapp-templates"
  | "platform-notifications"
  | "reports"
  | "carts"
  | "settings"
  | "visual-settings"
  | "contact-us"
  | "roles"
  | "design-system";

export type TourSide = "top" | "right" | "bottom" | "left";
export type TourAlign = "start" | "center" | "end";

export type TourStepDef = {
  id: string;
  /** `data-guidance` attribute value */
  anchor?: string;
  title: string;
  description: string;
  side?: TourSide;
  align?: TourAlign;
  skipIfMissing?: boolean;
  advanceOnClick?: boolean;
  /** Milliseconds to wait for the anchor element (e.g. after create drawer opens). */
  waitForElement?: number;
  /** Click the highlighted element when the step starts (e.g. switch a form tab). */
  clickToActivate?: boolean;
};

export type GuidanceChecklistItemDef = {
  id: string;
  label: string;
};

export type GuidanceHotspotDef = {
  id: string;
  label: string;
  anchor: string;
};

export type GuidanceCopyBlock = {
  title: string;
  description: string;
};

export type PageGuidanceAnchors = {
  title: string;
  search: string;
  filters: string;
  add: string;
  rowActions: string;
  status?: string;
};

export type PageGuidanceConfig = {
  pageId: GuidancePageId;
  /** Route path prefix used for registry lookup, e.g. `/admin/brands` */
  routePath: string;
  anchors: PageGuidanceAnchors;
  productTour: TourStepDef[];
  coachMarks?: TourStepDef[];
  walkthrough?: TourStepDef[];
  /** Short tour of the create/edit side panel (auto-runs once when create opens). */
  formTour?: TourStepDef[];
  checklist?: {
    title: string;
    description: string;
    items: GuidanceChecklistItemDef[];
  };
  contextualTip?: GuidanceCopyBlock;
  featureDiscovery?: GuidanceCopyBlock;
  hotspots?: GuidanceHotspotDef[];
  /** Auto-run product tour once on first visit (Dashboard). */
  autoProductTourOnce?: boolean;
  /** Auto-run formTour once the first time the create form opens (drawer or workspace page). Default true for CRUD. */
  autoFormTourOnce?: boolean;
  /** Show contextual tip on first visit (until dismissed). Default false — open from Help when needed. */
  autoShowTip?: boolean;
  /** Show What’s new banner on first visit (until dismissed). Default false — open from Help when needed. */
  autoShowFeatureDiscovery?: boolean;
};

export type GuidanceOverlayState = {
  showChecklist: boolean;
  showTip: boolean;
  showBanner: boolean;
  showHotspots: boolean;
};

export type GuidancePersistedState = {
  seenProductTour: boolean;
  seenFormTour: boolean;
  checklist: Record<string, boolean>;
  hotspotsDismissed: Record<string, boolean>;
  bannerDismissed: boolean;
  tipDismissed: boolean;
  overlay: GuidanceOverlayState;
};
