import { carePlansFormTour } from "@/shared/guidance/configs/care-plans-form-tour";
import { couponsFormTour } from "@/shared/guidance/configs/coupons-form-tour";
import { createCrudGuidance, defaultFormTour } from "@/shared/guidance/configs/create-crud-guidance";
import { ordersFormTour } from "@/shared/guidance/configs/orders-form-tour";
import { productsFormTour } from "@/shared/guidance/configs/products-form-tour";
import {
  CARE_PLAN_GUIDANCE_ANCHORS,
  createStandardAnchors,
  HOMEPAGE_GUIDANCE_ANCHORS,
  LOYALTY_FORM_ANCHORS,
} from "@/shared/guidance/constants/guidance.constants";
import type { PageGuidanceConfig } from "@/shared/guidance/types/guidance.types";

function crud(
  pageId: Parameters<typeof createCrudGuidance>[0]["pageId"],
  routePath: string,
  pageTitle: string,
  entityPlural: string,
  extras?: Partial<Parameters<typeof createCrudGuidance>[0]>,
): PageGuidanceConfig {
  return createCrudGuidance({
    pageId,
    routePath,
    copy: { pageTitle, entityPlural },
    ...extras,
  });
}

const anchors = createStandardAnchors("orders");

export const ordersGuidanceConfig: PageGuidanceConfig = createCrudGuidance({
  pageId: "orders",
  routePath: "/admin/orders",
  copy: {
    pageTitle: "Orders",
    entityPlural: "orders",
    workspaceDescription: "Manage customer orders, statuses, and documents from this page.",
    searchDescription: "Find orders quickly by customer name, email, or reference.",
    filtersDescription: "Narrow the list by status and other fields, or open more filters.",
    addTitle: "Create an order",
    addDescription:
      "Start a new order with customer, products, and delivery. Use Coupons for promo codes (including Quick coupon). Loyalty point discounts come from a customer redemption, not this picker.",
    actionsTitle: "Row actions",
    actionsDescription: "View, edit, or download invoices and packing slips per order.",
  },
  includeStatusStep: true,
  statusStep: {
    id: "status",
    anchor: anchors.status,
    title: "Quick status change",
    description: "Click the status badge to update an order without opening the edit form.",
    side: "bottom",
    align: "start",
    skipIfMissing: true,
  },
  coachMarks: [
    {
      id: "coach-add",
      anchor: anchors.add,
      title: "Add Order",
      description: "Use this when you need to create an order manually.",
      side: "bottom",
      align: "end",
      skipIfMissing: true,
    },
    {
      id: "coach-search",
      anchor: anchors.search,
      title: "Search",
      description: "Type here anytime you need to locate a specific order.",
      side: "bottom",
      align: "start",
      skipIfMissing: true,
    },
    {
      id: "coach-status",
      anchor: anchors.status,
      title: "Change status",
      description: "Use the status badge dropdown for a one-click status update.",
      side: "bottom",
      align: "start",
      skipIfMissing: true,
    },
  ],
  walkthrough: [
    {
      id: "walk-intro",
      title: "Create-order walkthrough",
      description: "We'll guide you through starting a new order. Click Next to begin.",
    },
    {
      id: "walk-add",
      anchor: anchors.add,
      title: "Click Add Order",
      description: "Click the highlighted button to open the create form.",
      side: "bottom",
      align: "end",
      advanceOnClick: true,
      skipIfMissing: true,
    },
    ...ordersFormTour(),
    {
      id: "walk-done",
      title: "Nice work",
      description:
        "The order workspace is ready. Open Coupons for a staff cart discount or free shipping, then save.",
    },
  ],
  formTour: ordersFormTour(),
  checklist: {
    title: "Get started with orders",
    description: "Complete these setup tasks to run orders smoothly.",
    items: [
      { id: "create-order", label: "Create your first order" },
      { id: "apply-quick-coupon", label: "Apply a quick cart coupon or free shipping" },
      { id: "delivery-zones", label: "Configure delivery zones" },
      { id: "review-filters", label: "Try status filters" },
      { id: "change-status", label: "Quick-update an order status" },
      { id: "download-docs", label: "Download a packing slip or invoice" },
    ],
  },
  contextualTip: {
    title: "Tip for this page",
    description:
      "On Add Order, open Coupons for a staff-only cart discount or free shipping. Loyalty discounts are not coupons — they show on the order view after a customer redemption.",
  },
  featureDiscovery: {
    title: "What's new: Quick coupon",
    description:
      "Create a one-off cart amount, percentage, or free-shipping coupon from the order Coupons section without opening the coupons module.",
  },
  autoShowTip: true,
  autoShowFeatureDiscovery: false,
});

export const dashboardGuidanceConfig: PageGuidanceConfig = {
  pageId: "dashboard",
  routePath: "/admin",
  anchors: {
    title: "dashboard-title",
    search: "dashboard-search",
    filters: "dashboard-filters",
    add: "dashboard-add",
    rowActions: "dashboard-row-actions",
  },
  autoProductTourOnce: true,
  productTour: [
    {
      id: "welcome",
      anchor: "dashboard-title",
      title: "Welcome to Aroma Care Admin",
      description:
        "This home view summarizes sales, stock, and work that needs attention. Use Help anytime to replay tours on any page.",
      side: "bottom",
      align: "start",
      skipIfMissing: true,
    },
    {
      id: "stats",
      anchor: "dashboard-stats",
      title: "Key metrics",
      description: "Track orders, revenue, and operational health at a glance.",
      side: "bottom",
      align: "start",
      skipIfMissing: true,
    },
    {
      id: "charts",
      anchor: "dashboard-charts",
      title: "Trends",
      description: "Revenue and category charts show how sales are performing over time.",
      side: "top",
      align: "start",
      skipIfMissing: true,
    },
    {
      id: "recent-orders",
      anchor: "dashboard-recent-orders",
      title: "Recent orders",
      description: "Jump into the latest orders from here when something needs fulfillment.",
      side: "top",
      align: "start",
      skipIfMissing: true,
    },
    {
      id: "attention",
      anchor: "dashboard-attention",
      title: "Needs attention",
      description: "Low stock and pending prescriptions surface work that may need a quick action.",
      side: "left",
      align: "start",
      skipIfMissing: true,
    },
    {
      id: "nav-products",
      anchor: "nav-products",
      title: "Products",
      description: "Open Products from the sidebar to manage catalog, visibility, and inventory.",
      side: "right",
      align: "start",
      skipIfMissing: true,
    },
    {
      id: "nav-orders",
      anchor: "nav-orders",
      title: "Orders",
      description: "Open Orders anytime to manage fulfillment and status updates.",
      side: "right",
      align: "start",
      skipIfMissing: true,
    },
    {
      id: "nav-care-plans",
      anchor: "nav-care-plans",
      title: "Care Plans",
      description:
        "Open Care Plans to manage Subscribe & Save subscriptions, missed payments, and upcoming cycles.",
      side: "right",
      align: "start",
      skipIfMissing: true,
    },
  ],
  coachMarks: [
    {
      id: "coach-stats",
      anchor: "dashboard-stats",
      title: "Metrics",
      description: "These cards update as orders and catalog activity change.",
      side: "bottom",
      align: "start",
      skipIfMissing: true,
    },
    {
      id: "coach-attention",
      anchor: "dashboard-attention",
      title: "Action widgets",
      description: "Check low stock and pending prescriptions regularly.",
      side: "left",
      align: "start",
      skipIfMissing: true,
    },
  ],
  contextualTip: {
    title: "Getting around",
    description: "Use Help in the header to replay this tour or open guidance on any page.",
  },
  autoShowTip: true,
};

export const profileGuidanceConfig: PageGuidanceConfig = {
  pageId: "profile",
  routePath: "/admin/profile",
  anchors: createStandardAnchors("profile"),
  productTour: [
    {
      id: "profile-title",
      anchor: "profile-title",
      title: "Your profile",
      description: "Update your account details and password from this page.",
      side: "bottom",
      align: "start",
      skipIfMissing: true,
    },
  ],
};

export const reportsGuidanceConfig: PageGuidanceConfig = {
  pageId: "reports",
  routePath: "/admin/reports",
  anchors: createStandardAnchors("reports"),
  productTour: [
    {
      id: "reports-title",
      anchor: "reports-title",
      title: "Reports",
      description: "Review charts and summaries for business performance.",
      side: "bottom",
      align: "start",
      skipIfMissing: true,
    },
  ],
};

export const notificationsGuidanceConfig: PageGuidanceConfig = createCrudGuidance({
  pageId: "notifications",
  routePath: "/admin/notifications",
  copy: {
    pageTitle: "Notifications",
    entityPlural: "notifications",
    workspaceDescription:
      "Your personal admin inbox. Mark items as read — compose platform messages from Platform Notifications.",
  },
});

export const platformNotificationsGuidanceConfig: PageGuidanceConfig = createCrudGuidance({
  pageId: "platform-notifications",
  routePath: "/admin/platform-notifications",
  copy: {
    pageTitle: "Platform Notifications",
    entityPlural: "platform notifications",
    workspaceDescription:
      "Browse and compose platform notifications. Read and delete actions are not available here.",
  },
});


export const designSystemGuidanceConfig: PageGuidanceConfig = {
  pageId: "design-system",
  routePath: "/admin/design-system",
  anchors: createStandardAnchors("design-system"),
  productTour: [
    {
      id: "ds-title",
      anchor: "design-system-title",
      title: "Design system",
      description: "Browse shared UI patterns, including the guidance showcase.",
      side: "bottom",
      align: "start",
      skipIfMissing: true,
    },
  ],
};

/** Standard CRUD configs for all list pages (Orders & Products are richer and defined above / below). */
export const productsGuidanceConfig: PageGuidanceConfig = createCrudGuidance({
  pageId: "products",
  routePath: "/admin/products",
  copy: {
    pageTitle: "Products",
    entityPlural: "products",
    workspaceDescription:
      "Manage your catalog — search, filter, import, and edit products. Clickable brand/category chips filter the table; visibility badges publish and flag products instantly.",
    searchDescription: "Find products by name or related fields.",
    filtersDescription: "Narrow by brand, category, badges, and more — or click a brand/category in a row to filter.",
    addTitle: "Add product",
    addDescription: "Create a product or import a CSV from the header actions.",
    actionsTitle: "Row actions",
    actionsDescription:
      "Hover a product name for Edit, Quick edit, Delete, Duplicate, and View on website.",
  },
  includeStatusStep: true,
  statusStep: {
    id: "visibility",
    anchor: "products-status",
    title: "Visibility (clickable)",
    description:
      "Click Active/Inactive to publish or unpublish. Icon chips toggle Featured, Best seller, Newly arrived, and similar flags without opening the form.",
    side: "left",
    align: "start",
    skipIfMissing: true,
  },
  coachMarks: [
    {
      id: "coach-add",
      anchor: "products-add",
      title: "Add or import",
      description: "Add a single product, or use Import when you have a CSV.",
      side: "bottom",
      align: "end",
      skipIfMissing: true,
    },
    {
      id: "coach-visibility",
      anchor: "products-status",
      title: "Quick visibility",
      description: "Click the status badge or icon chips to change storefront visibility instantly.",
      side: "left",
      align: "start",
      skipIfMissing: true,
    },
    {
      id: "coach-row-actions",
      anchor: "products-row-actions",
      title: "Row actions",
      description: "Hover the product name to reveal Edit, Quick edit, Duplicate, and more.",
      side: "bottom",
      align: "start",
      skipIfMissing: true,
    },
    {
      id: "coach-search",
      anchor: "products-search",
      title: "Search",
      description: "Type here anytime to locate a product.",
      side: "bottom",
      align: "start",
      skipIfMissing: true,
    },
  ],
  walkthrough: [
    {
      id: "walk-intro",
      title: "Create-product walkthrough",
      description: "We'll open the full product workspace. Click Next to begin.",
    },
    {
      id: "walk-add",
      anchor: "products-add",
      title: "Click Add product",
      description: "Click the highlighted button to open the full product page.",
      side: "bottom",
      align: "end",
      advanceOnClick: true,
      skipIfMissing: true,
    },
    ...productsFormTour(),
    {
      id: "walk-done",
      title: "Nice work",
      description:
        "The product workspace will open as a full page. Use the left sections, then save from the top bar.",
    },
  ],
  formTour: productsFormTour(),
  checklist: {
    title: "Get started with products",
    description: "Complete these tasks to manage the catalog confidently.",
    items: [
      { id: "create-first", label: "Create your first product" },
      { id: "try-search", label: "Try the search field" },
      { id: "try-filters", label: "Try filters or sorting" },
      { id: "try-visibility", label: "Toggle a visibility badge" },
      { id: "try-quick-edit", label: "Open Quick edit on a product" },
    ],
  },
  contextualTip: {
    title: "Tip for products",
    description:
      "Click a brand or category in a row to filter the table. Use visibility badges for one-click publish and merchandising flags.",
  },
  featureDiscovery: {
    title: "What's new: quick visibility",
    description:
      "Publish and merchandising flags are clickable in the Visibility column — no need to open the full form.",
  },
  autoShowTip: true,
  autoShowFeatureDiscovery: false,
});

const carePlanAnchors = createStandardAnchors("care-plans");

export const carePlansGuidanceConfig: PageGuidanceConfig = createCrudGuidance({
  pageId: "care-plans",
  routePath: "/admin/care-plans",
  copy: {
    pageTitle: "Care Plans",
    entityPlural: "care plans",
    workspaceDescription:
      "Manage Subscribe & Save plans — widgets flag missed payments and stock gaps, then search, pause, or skip cycles from the list and record workspace.",
    searchDescription: "Find plans by customer name or email.",
    filtersDescription: "Narrow by status, frequency, and other fields.",
    addTitle: "Add care plan",
    addDescription: "Create a plan with a customer, schedule, and products approved for Care Plan.",
    actionsTitle: "Row actions",
    actionsDescription: "View a plan, edit details, or cancel it from the row actions.",
  },
  prependProductSteps: [
    {
      id: "care-plan-widgets",
      anchor: CARE_PLAN_GUIDANCE_ANCHORS.widgets,
      title: "Operations widgets",
      description:
        "Awaiting payment, out-of-stock items, and top subscribed products surface work that may need a quick action.",
      side: "bottom",
      align: "start",
      skipIfMissing: true,
    },
  ],
  extraProductSteps: [
    {
      id: "care-plan-lifecycle",
      anchor: CARE_PLAN_GUIDANCE_ANCHORS.lifecycle,
      title: "Pause, resume, cancel",
      description:
        "From a plan’s Lifecycle section you can pause, resume, or cancel it, and skip a scheduled cycle.",
      side: "left",
      align: "start",
      skipIfMissing: true,
    },
  ],
  coachMarks: [
    {
      id: "coach-add",
      anchor: carePlanAnchors.add,
      title: "Add care plan",
      description: "Use this when you need to create a Subscribe & Save plan for a customer.",
      side: "bottom",
      align: "end",
      skipIfMissing: true,
    },
    {
      id: "coach-widgets",
      anchor: CARE_PLAN_GUIDANCE_ANCHORS.widgets,
      title: "Widgets",
      description: "Check awaiting payments and stock gaps before the next delivery cycle.",
      side: "bottom",
      align: "start",
      skipIfMissing: true,
    },
    {
      id: "coach-search",
      anchor: carePlanAnchors.search,
      title: "Search",
      description: "Type a customer name or email to locate a plan.",
      side: "bottom",
      align: "start",
      skipIfMissing: true,
    },
  ],
  walkthrough: [
    {
      id: "walk-intro",
      title: "Create-care-plan walkthrough",
      description: "We'll open the full care-plan workspace. Click Next to begin.",
    },
    {
      id: "walk-add",
      anchor: carePlanAnchors.add,
      title: "Click Add care plan",
      description: "Click the highlighted button to open the create page.",
      side: "bottom",
      align: "end",
      advanceOnClick: true,
      skipIfMissing: true,
    },
    ...carePlansFormTour(),
    {
      id: "walk-done",
      title: "Nice work",
      description:
        "The care-plan workspace will open as a full page. Fill Basics and Items, then save from the top bar.",
    },
  ],
  formTour: carePlansFormTour(),
  checklist: {
    title: "Get started with care plans",
    description: "Complete these tasks to manage Subscribe & Save confidently.",
    items: [
      { id: "create-first", label: "Create your first care plan" },
      { id: "try-search", label: "Try the search field" },
      { id: "try-filters", label: "Try filters or sorting" },
      { id: "review-widgets", label: "Review the operations widgets" },
      { id: "open-lifecycle", label: "Open a plan and review lifecycle actions" },
    ],
  },
  contextualTip: {
    title: "Tip for care plans",
    description:
      "Use the widgets for missed payments and stock before the next cycle. Open a plan to pause, resume, or skip a delivery.",
  },
  featureDiscovery: {
    title: "What's new: Care Plans",
    description:
      "Subscribe & Save is now in Admin. Track upcoming cycles, missed payments, and stock from this page.",
  },
  autoShowTip: true,
  autoShowFeatureDiscovery: false,
});

export const homepageGuidanceConfig: PageGuidanceConfig = {
  pageId: "homepage",
  routePath: "/admin/homepage",
  anchors: createStandardAnchors("homepage"),
  autoFormTourOnce: true,
  productTour: [
    {
      id: "title",
      anchor: HOMEPAGE_GUIDANCE_ANCHORS.title,
      title: "Homepage CMS",
      description:
        "Manage storefront hero sliders, slider promotions, and static banners from one place, then preview the layout.",
      side: "bottom",
      align: "start",
      skipIfMissing: true,
    },
    {
      id: "homepage-tabs",
      anchor: HOMEPAGE_GUIDANCE_ANCHORS.tabs,
      title: "Homepage tabs",
      description:
        "Switch between Sliders, Slider promotions, Static promotions, and Preview. Each list tab has search, filters, and Add.",
      side: "bottom",
      align: "start",
      skipIfMissing: true,
    },
    {
      id: "search",
      anchor: "sliders-search",
      title: "Search",
      description: "Find banners in the current tab by typing in the search field.",
      side: "bottom",
      align: "start",
      skipIfMissing: true,
    },
    {
      id: "search",
      anchor: "slider-promotions-search",
      title: "Search",
      description: "Find banners in the current tab by typing in the search field.",
      side: "bottom",
      align: "start",
      skipIfMissing: true,
    },
    {
      id: "search",
      anchor: "static-promotions-search",
      title: "Search",
      description: "Find banners in the current tab by typing in the search field.",
      side: "bottom",
      align: "start",
      skipIfMissing: true,
    },
    {
      id: "add",
      anchor: "sliders-add",
      title: "Add banner",
      description: "Create a slider, slider promotion, or static promotion from the current tab.",
      side: "bottom",
      align: "end",
      skipIfMissing: true,
    },
    {
      id: "add",
      anchor: "slider-promotions-add",
      title: "Add banner",
      description: "Create a slider, slider promotion, or static promotion from the current tab.",
      side: "bottom",
      align: "end",
      skipIfMissing: true,
    },
    {
      id: "add",
      anchor: "static-promotions-add",
      title: "Add banner",
      description: "Create a slider, slider promotion, or static promotion from the current tab.",
      side: "bottom",
      align: "end",
      skipIfMissing: true,
    },
    {
      id: "homepage-preview",
      anchor: HOMEPAGE_GUIDANCE_ANCHORS.preview,
      title: "Preview",
      description: "Open the Preview tab to see how the homepage layout looks before publishing.",
      side: "left",
      align: "start",
      skipIfMissing: true,
    },
  ],
  coachMarks: [
    {
      id: "coach-homepage-tabs",
      anchor: HOMEPAGE_GUIDANCE_ANCHORS.tabs,
      title: "Tabs",
      description: "Use these tabs to edit each homepage block without leaving this page.",
      side: "bottom",
      align: "start",
      skipIfMissing: true,
    },
    {
      id: "coach-add",
      anchor: "sliders-add",
      title: "Create",
      description: "Add a new banner from the current tab.",
      side: "bottom",
      align: "end",
      skipIfMissing: true,
    },
  ],
  walkthrough: [
    {
      id: "walk-intro",
      title: "Homepage walkthrough",
      description: "We'll guide you through adding a homepage slider. Click Next to begin.",
    },
    {
      id: "walk-add",
      anchor: "sliders-add",
      title: "Click Create",
      description: "Click the highlighted button to open the create form.",
      side: "bottom",
      align: "end",
      advanceOnClick: true,
      skipIfMissing: true,
    },
    {
      id: "walk-done",
      title: "Nice work",
      description: "The form is ready. Fill it in and save when you're done.",
    },
  ],
  formTour: defaultFormTour(),
  checklist: {
    title: "Get started with homepage CMS",
    description: "Complete these tasks to manage the storefront homepage.",
    items: [
      { id: "create-first", label: "Create your first slider" },
      { id: "try-search", label: "Try the search field" },
      { id: "try-filters", label: "Try filters or sorting" },
    ],
  },
  contextualTip: {
    title: "Tip for homepage",
    description:
      "Edit sliders and promotions here, then open Preview to check the storefront layout.",
  },
  autoShowTip: true,
};

export const crudGuidanceConfigs: PageGuidanceConfig[] = [
  crud("invoices", "/admin/invoices", "Invoices", "invoices"),
  crud("order-items", "/admin/order-items", "Order items", "order items"),
  // products defined separately as productsGuidanceConfig
  crud("product-reviews", "/admin/product-reviews", "Product reviews", "product reviews"),
  crud("categories", "/admin/categories", "Categories", "categories"),
  crud("brands", "/admin/brands", "Brands", "brands"),
  crud("countries", "/admin/countries", "Countries", "countries"),
  crud("states", "/admin/states", "States", "states"),
  crud("currencies", "/admin/currencies", "Currencies", "currencies"),
  crud("payment-providers", "/admin/payment-providers", "Payment providers", "payment providers"),
  crud(
    "delivery-zones-prices",
    "/admin/delivery-zones-prices",
    "Delivery zone prices",
    "delivery zone prices",
  ),
  crud("holidays", "/admin/holidays", "Holidays", "holidays"),
  crud("tags", "/admin/tags", "Tags", "tags"),
  crud("attributes", "/admin/attributes", "Attributes", "attributes"),
  crud("attribute-values", "/admin/attribute-values", "Attribute values", "attribute values"),
  crud("users", "/admin/users", "Users", "users"),
  crud("prescriptions", "/admin/prescriptions", "Prescriptions", "prescriptions"),
  crud("inventory", "/admin/inventory", "Inventory", "inventory"),
  crud("promotions", "/admin/promotions", "Promotions", "promotions"),
  crud("promotion-usages", "/admin/promotion-usages", "Promotion usages", "promotion usages"),
  crud("carts", "/admin/carts", "Carts", "carts"),
  crud("sliders", "/admin/sliders", "Sliders", "sliders"),
  crud("slider-promotions", "/admin/slider-promotions", "Slider promotions", "slider promotions"),
  crud(
    "static-promotions",
    "/admin/static-promotions",
    "Static promotions",
    "static promotions",
  ),
  crud("trending-searches", "/admin/trending-searches", "Trending searches", "trending searches"),
  crud("settings", "/admin/settings", "Settings", "settings"),
  crud("visual-settings", "/admin/visual-settings", "Visual settings", "visual settings"),
  crud("contact-us", "/admin/contact-us", "Contact us", "contact messages"),
  crud("whatsapp-templates", "/admin/whatsapp-templates", "WhatsApp templates", "WhatsApp templates", {
    copy: {
      pageTitle: "WhatsApp templates",
      entityPlural: "WhatsApp templates",
      addTitle: "Sync from Meta",
      addDescription: "Re-read template text and approval status from Meta.",
      actionsTitle: "Row actions",
      actionsDescription: "View the message, change the switch and note, or send a test to one number.",
      workspaceDescription:
        "Turn each WhatsApp message on or off, preview it, and send a test. Templates are not created or deleted here.",
    },
    includeChecklist: false,
    includeWalkthrough: false,
    includeCoachMarks: false,
    contextualTip: {
      title: "Tip for WhatsApp templates",
      description:
        "The switch is yours. The message text and approval status come from Meta — use Sync if the preview looks old.",
    },
  }),
  crud("roles", "/admin/roles", "Roles", "roles"),
];

export const couponsGuidanceConfig: PageGuidanceConfig = createCrudGuidance({
  pageId: "coupons",
  routePath: "/admin/coupons",
  copy: {
    pageTitle: "Coupons",
    entityPlural: "coupons",
    workspaceDescription:
      "Promo codes for carts, items, or shipping. Loyalty is a separate program (points → reward → redemption), not a coupon.",
    searchDescription: "Find coupons by code or title.",
    filtersDescription:
      "Filter by type, scope, status, audience, auto-apply, and Staff only (admin orders).",
    addTitle: "Add coupon",
    addDescription:
      "Create a promo code. Use Staff only for internal discounts that customers cannot apply on the website.",
    actionsTitle: "Row actions",
    actionsDescription: "View, edit, or delete a coupon from the row actions.",
  },
  extraProductSteps: [
    {
      id: "coupon-not-loyalty",
      anchor: createStandardAnchors("coupons").title,
      title: "Coupons vs loyalty",
      description:
        "A coupon is a code applied to an order. Loyalty rewards spend points and create a redemption — they are not created here.",
      side: "bottom",
      align: "start",
      skipIfMissing: true,
    },
  ],
  formTour: couponsFormTour(),
  checklist: {
    title: "Get started with coupons",
    description: "Learn staff-only codes and how they differ from loyalty rewards.",
    items: [
      { id: "create-first", label: "Create your first coupon" },
      { id: "create-staff-coupon", label: "Mark a coupon as staff only" },
      { id: "try-search", label: "Try the search field" },
      { id: "try-filters", label: "Filter by Staff only" },
    ],
  },
  contextualTip: {
    title: "Tip for coupons",
    description:
      "Staff-only coupons work on admin orders and are rejected on the website. For a one-off cart discount while creating an order, use Quick coupon on the order form instead of leaving this page.",
  },
  featureDiscovery: {
    title: "What's new: staff-only coupons",
    description:
      "Turn on Staff only so the code cannot be used on the storefront. Filter the list with Staff only to find internal codes.",
  },
  autoShowTip: true,
});

export const promotionsGuidanceConfig: PageGuidanceConfig = createCrudGuidance({
  pageId: "promotions",
  routePath: "/admin/promotions",
  copy: {
    pageTitle: "Promotions",
    entityPlural: "promotions",
    workspaceDescription:
      "BOGO gift offers. Unlike coupons, promotions add free reward lines instead of re-pricing purchased items.",
    searchDescription: "Find promotions by name or code.",
    filtersDescription: "Filter by active state, type, running window, or login requirement.",
    addTitle: "Add promotion",
    addDescription: "Create a BOGO code, then attach buy/get deals with products or variants.",
    actionsTitle: "Row actions",
    actionsDescription: "View, edit, or delete a promotion from the row actions.",
  },
  checklist: {
    title: "Get started with BOGO promotions",
    description: "Create an offer, then configure deals, buy items, and gift rewards.",
    items: [
      { id: "create-first", label: "Create the promotion code and bilingual name" },
      { id: "set-schedule", label: "Set schedule and usage limits if needed" },
      { id: "add-deals", label: "Add BOGO deals with buy items and gift rewards" },
    ],
  },
  contextualTip: {
    title: "Tip for promotions",
    description:
      "After saving the offer, open the BOGO deals section to attach buy items and gift rewards. Coupons and promotions can coexist on a cart without fighting over the same line prices.",
  },
  autoShowTip: true,
});

export const loyaltyEventsGuidanceConfig: PageGuidanceConfig = createCrudGuidance({
  pageId: "loyalty-events",
  routePath: "/admin/loyalty-events",
  copy: {
    pageTitle: "Loyalty Events",
    entityPlural: "loyalty events",
    workspaceDescription:
      "Events grant points (sign-up, first order, care plan, milestones). Turning an event off stops awarding points immediately. This is not a coupon.",
    searchDescription: "Find events by name or code.",
    filtersDescription: "Filter by code, type, and active status.",
    addTitle: "Add loyalty event",
    addDescription: "Define how customers earn points. Keep seeded events unless you need a new rule.",
    actionsTitle: "Row actions",
    actionsDescription: "View, edit, or delete an event. Use the Active toggle to pause earning.",
  },
  extraProductSteps: [
    {
      id: "loyalty-not-coupon",
      anchor: createStandardAnchors("loyalty-events").title,
      title: "Loyalty is not a coupon",
      description:
        "Events award points. Customers later redeem a reward. Promo codes live under Coupons.",
      side: "bottom",
      align: "start",
      skipIfMissing: true,
    },
  ],
  checklist: {
    title: "Get started with loyalty events",
    description: "Control when the program awards points.",
    items: [
      { id: "create-first", label: "Review or create a loyalty event" },
      { id: "disable-loyalty-event", label: "Turn an event off to stop awarding points" },
      { id: "try-filters", label: "Filter by type or active" },
    ],
  },
  contextualTip: {
    title: "Tip for loyalty events",
    description:
      "Disable an event to stop granting points immediately. Do not create a coupon here — coupons are a different module, and order loyalty discounts come from redemptions.",
  },
  autoShowTip: true,
});

export const loyaltyRewardsGuidanceConfig: PageGuidanceConfig = createCrudGuidance({
  pageId: "loyalty-rewards",
  routePath: "/admin/loyalty-rewards",
  copy: {
    pageTitle: "Loyalty Rewards",
    entityPlural: "loyalty rewards",
    workspaceDescription:
      "Rewards customers buy with points (fixed, percentage, or free shipping). Not a coupon. Set a minimum cart total when the reward should require a basket amount.",
    searchDescription: "Find rewards by name or code.",
    filtersDescription: "Filter by type and active status.",
    addTitle: "Add loyalty reward",
    addDescription:
      "Set points cost and reward type. Free shipping has no reward value; the discount appears on the order after shipping is priced.",
    actionsTitle: "Row actions",
    actionsDescription: "View, edit, or delete a reward. Inactive rewards cannot be redeemed.",
  },
  extraProductSteps: [
    {
      id: "loyalty-not-coupon",
      anchor: createStandardAnchors("loyalty-rewards").title,
      title: "Rewards vs coupons",
      description:
        "A reward is purchased with points. A coupon is a code on the order. Use Coupons (or Quick coupon on Add Order) for staff cart discounts.",
      side: "bottom",
      align: "start",
      skipIfMissing: true,
    },
  ],
  formTour: [
    ...defaultFormTour(),
    {
      id: "loyalty-reward-min-cart",
      anchor: LOYALTY_FORM_ANCHORS.rewardMinCart,
      title: "Minimum cart total",
      description:
        "Optional basket minimum for this reward. Leave empty if any cart can use it after redemption.",
      side: "left",
      align: "start",
      skipIfMissing: true,
    },
  ],
  checklist: {
    title: "Get started with loyalty rewards",
    description: "Configure what points can buy.",
    items: [
      { id: "create-first", label: "Create a loyalty reward" },
      { id: "loyalty-min-cart", label: "Set a minimum cart total on a fixed reward" },
      { id: "try-filters", label: "Filter by reward type" },
    ],
  },
  contextualTip: {
    title: "Tip for loyalty rewards",
    description:
      "Free shipping needs no reward value. Changing a reward later does not change loyaltyDiscountPrice already stored on past orders.",
  },
  autoShowTip: true,
});

export const loyaltyRedemptionsGuidanceConfig: PageGuidanceConfig = createCrudGuidance({
  pageId: "loyalty-redemptions",
  routePath: "/admin/loyalty-redemptions",
  copy: {
    pageTitle: "Loyalty Redemptions",
    entityPlural: "loyalty redemptions",
    workspaceDescription:
      "Read-only list of rewards customers already redeemed. You cannot create a redemption from admin — checkout applies an active redemption from the customer cart.",
    searchDescription: "Find redemptions by customer or reward.",
    filtersDescription: "Filter by status, customer ID, or reward ID.",
    actionsTitle: "Row actions",
    actionsDescription: "Open a redemption to see points, status, and dates.",
  },
  includeWalkthrough: false,
  includeFormTour: false,
  includeCoachMarks: false,
  extraProductSteps: [
    {
      id: "loyalty-readonly",
      anchor: createStandardAnchors("loyalty-redemptions").title,
      title: "View only",
      description:
        "There is no create or edit here. Used redemptions show as the loyalty line on the related order.",
      side: "bottom",
      align: "start",
      skipIfMissing: true,
    },
  ],
  checklist: {
    title: "Get started with redemptions",
    description: "Inspect customer reward usage.",
    items: [
      { id: "try-search", label: "Try the search field" },
      { id: "try-filters", label: "Filter by status" },
    ],
  },
  contextualTip: {
    title: "Tip for redemptions",
    description:
      "A redemption is not a coupon. After it is used on an order, the frozen loyalty discount appears on the order Coupons section.",
  },
  autoShowTip: true,
});

export const loyaltyLedgerGuidanceConfig: PageGuidanceConfig = createCrudGuidance({
  pageId: "loyalty-ledger",
  routePath: "/admin/loyalty-ledger",
  copy: {
    pageTitle: "Points Ledger",
    entityPlural: "ledger entries",
    workspaceDescription:
      "Read-only points history: earn, redeem, and adjust. There is no admin screen to change a balance in this release.",
    searchDescription: "Find entries by customer or note.",
    filtersDescription: "Filter by type, customer, event, reward, or order ID.",
    actionsTitle: "Row actions",
    actionsDescription: "Open an entry to see the note and linked event, reward, or order.",
  },
  includeWalkthrough: false,
  includeFormTour: false,
  includeCoachMarks: false,
  extraProductSteps: [
    {
      id: "loyalty-readonly",
      anchor: createStandardAnchors("loyalty-ledger").title,
      title: "View only",
      description:
        "ADJUST rows are corrections already stored by the system. You cannot post a new adjustment from this list.",
      side: "bottom",
      align: "start",
      skipIfMissing: true,
    },
  ],
  checklist: {
    title: "Get started with the points ledger",
    description: "Trace how a customer’s balance changed.",
    items: [
      { id: "try-search", label: "Try the search field" },
      { id: "try-filters", label: "Filter by earn, redeem, or adjust" },
    ],
  },
  contextualTip: {
    title: "Tip for the ledger",
    description:
      "Use this list to audit points. Promo codes are under Coupons. Order loyalty amounts are snapshots and do not change if you edit a reward later.",
  },
  autoShowTip: true,
});

export const customersGuidanceConfig: PageGuidanceConfig = createCrudGuidance({
  pageId: "customers",
  routePath: "/admin/customers",
  copy: {
    pageTitle: "CRM",
    entityPlural: "customers",
    workspaceDescription:
      "Customer 360 — segments, orders, Care Plan, loyalty, staff notes, and CRM actions.",
    searchDescription: "Search customers by name, phone, or email.",
    filtersDescription: "Filter by segment, tag, account status, and Care Plan subscription.",
    actionsTitle: "Customer file",
    actionsDescription: "Open the CRM workspace to edit profile, notes, VIP, coupons, and notifications.",
  },
  coachMarks: [
    {
      id: "coach-stats",
      anchor: "crm-stats",
      title: "CRM KPIs",
      description: "Click a KPI card to filter the list by that segment.",
      side: "bottom",
      align: "start",
      skipIfMissing: true,
    },
  ],
  contextualTip: {
    title: "Tip for CRM",
    description:
      "Account create/delete stays under Users. Use the customer file for staff notes, VIP, and Care Plan actions.",
  },
  autoShowTip: true,
});

export const allGuidanceConfigs: PageGuidanceConfig[] = [
  dashboardGuidanceConfig,
  ordersGuidanceConfig,
  productsGuidanceConfig,
  carePlansGuidanceConfig,
  homepageGuidanceConfig,
  couponsGuidanceConfig,
  promotionsGuidanceConfig,
  loyaltyEventsGuidanceConfig,
  loyaltyRewardsGuidanceConfig,
  loyaltyRedemptionsGuidanceConfig,
  loyaltyLedgerGuidanceConfig,
  customersGuidanceConfig,
  ...crudGuidanceConfigs,
  profileGuidanceConfig,
  reportsGuidanceConfig,
  notificationsGuidanceConfig,
  platformNotificationsGuidanceConfig,
  designSystemGuidanceConfig,
];
