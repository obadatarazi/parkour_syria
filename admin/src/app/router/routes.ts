import {
  decodeAdminRouteKey,
  encodeAdminRouteKey,
  getCouponRouteKey,
  getOrderRouteKey,
  getPrescriptionRouteKey,
  getProductRouteKey,
  getPromotionRouteKey,
  isNumericAdminRouteKey,
} from "@/shared/lib/routing/admin-route-keys.utils";

export const ROUTES = {
  root: "/",
  login: "/login",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  notAuthorized: "/not-authorized",
  admin: {
    root: "/admin",

    // Parkour Syria Phase 1
    pages: "/admin/pages",
    book: "/admin/book",
    lessons: "/admin/lessons",
    areas: "/admin/areas",
    directoryEntries: "/admin/directory-entries",
    events: "/admin/events",
    suggestions: "/admin/suggestions",
    blogPosts: "/admin/blog-posts",
    blogCategories: "/admin/blog-categories",
    galleryImages: "/admin/gallery-images",

    // Copied from Aroma Care. Only the shop routes are registered, and only with
    // VITE_FEATURE_ECOMMERCE=true; the rest stay as constants the dormant features compile against.
    orders: "/admin/orders",
    orderNew: "/admin/orders/new",
    carePlans: "/admin/care-plans",
    carePlanNew: "/admin/care-plans/new",
    invoices: "/admin/invoices",
    orderItems: "/admin/order-items",
    products: "/admin/products",
    productNew: "/admin/products/new",
    productReviews: "/admin/product-reviews",
    categories: "/admin/categories",
    brands: "/admin/brands",
    countries: "/admin/countries",
    states: "/admin/states",
    currencies: "/admin/currencies",
    paymentProviders: "/admin/payment-providers",
    deliveryZonesPrices: "/admin/delivery-zones-prices",
    holidays: "/admin/holidays",
    tags: "/admin/tags",
    trendingSearches: "/admin/trending-searches",
    loyaltyEvents: "/admin/loyalty-events",
    loyaltyRewards: "/admin/loyalty-rewards",
    loyaltyRedemptions: "/admin/loyalty-redemptions",
    loyaltyLedger: "/admin/loyalty-ledger",
    attributes: "/admin/attributes",
    attributeValues: "/admin/attribute-values",
    customers: "/admin/customers",
    users: "/admin/users",
    profile: "/admin/profile",
    prescriptions: "/admin/prescriptions",
    prescriptionNew: "/admin/prescriptions/new",
    inventory: "/admin/inventory",
    homepage: "/admin/homepage",
    promotions: "/admin/promotions",
    promotionNew: "/admin/promotions/new",
    promotionUsages: "/admin/promotion-usages",
    carts: "/admin/carts",
    sliders: "/admin/sliders",
    sliderPromotions: "/admin/slider-promotions",
    staticPromotions: "/admin/static-promotions",
    coupons: "/admin/coupons",
    couponNew: "/admin/coupons/new",
    notifications: "/admin/notifications",
    notificationRoutes: "/admin/notification-routes",
    whatsappTemplates: "/admin/whatsapp-templates",
    platformNotifications: "/admin/platform-notifications",
    reports: "/admin/reports",
    settings: "/admin/settings",
    visualSettings: "/admin/visual-settings",
    contactUs: "/admin/contact-us",
    roles: "/admin/roles",
    designSystem: "/admin/design-system",
  },
} as const;

export type AdminRouteKey = keyof Omit<typeof ROUTES.admin, "root">;

type ProductRouteRef = { slug?: string | null; id: number } | string;
type CouponRouteRef = { code?: string | null; id: number } | string;
type PromotionRouteRef = { code?: string | null; id: number } | string;
type OrderRouteRef = { orderRefNumber?: string | null; id: number } | string;
type PrescriptionRouteRef = { prescriptionNumber?: string | null; id: number } | string;

function productRouteSegment(ref: ProductRouteRef): string {
  const key = typeof ref === "string" ? ref : getProductRouteKey(ref);
  return encodeAdminRouteKey(key);
}

function couponRouteSegment(ref: CouponRouteRef): string {
  const key = typeof ref === "string" ? ref : getCouponRouteKey(ref);
  return encodeAdminRouteKey(key);
}

function promotionRouteSegment(ref: PromotionRouteRef): string {
  const key = typeof ref === "string" ? ref : getPromotionRouteKey(ref);
  return encodeAdminRouteKey(key);
}

function orderRouteSegment(ref: OrderRouteRef): string {
  const key = typeof ref === "string" ? ref : getOrderRouteKey(ref);
  return encodeAdminRouteKey(key);
}

function prescriptionRouteSegment(ref: PrescriptionRouteRef): string {
  const key = typeof ref === "string" ? ref : getPrescriptionRouteKey(ref);
  return encodeAdminRouteKey(key);
}

export function productEditPath(ref: ProductRouteRef): string {
  return `${ROUTES.admin.products}/${productRouteSegment(ref)}/edit`;
}

export function productViewPath(ref: ProductRouteRef): string {
  return `${ROUTES.admin.products}/${productRouteSegment(ref)}`;
}

export function productsByBrandPath(brandId: number): string {
  return `${ROUTES.admin.products}?brandId=${encodeURIComponent(String(brandId))}`;
}

export function couponEditPath(ref: CouponRouteRef): string {
  return `${ROUTES.admin.coupons}/${couponRouteSegment(ref)}/edit`;
}

export function couponViewPath(ref: CouponRouteRef): string {
  return `${ROUTES.admin.coupons}/${couponRouteSegment(ref)}`;
}

export function promotionEditPath(ref: PromotionRouteRef): string {
  return `${ROUTES.admin.promotions}/${promotionRouteSegment(ref)}/edit`;
}

export function promotionViewPath(ref: PromotionRouteRef): string {
  return `${ROUTES.admin.promotions}/${promotionRouteSegment(ref)}`;
}

export function orderEditPath(ref: OrderRouteRef): string {
  return `${ROUTES.admin.orders}/${orderRouteSegment(ref)}/edit`;
}

export function orderViewPath(ref: OrderRouteRef): string {
  return `${ROUTES.admin.orders}/${orderRouteSegment(ref)}`;
}

export function carePlanEditPath(carePlanId: number): string {
  return `${ROUTES.admin.carePlans}/${carePlanId}/edit`;
}

export function carePlanViewPath(carePlanId: number): string {
  return `${ROUTES.admin.carePlans}/${carePlanId}`;
}

export function prescriptionEditPath(
  ref: PrescriptionRouteRef,
  section: "customer" | "document" | "products" = "products",
): string {
  const path = `${ROUTES.admin.prescriptions}/${prescriptionRouteSegment(ref)}/edit`;
  return `${path}?section=${section}`;
}

export function prescriptionViewPath(ref: PrescriptionRouteRef): string {
  return `${ROUTES.admin.prescriptions}/${prescriptionRouteSegment(ref)}`;
}

export function customerCrmPath(customerId: number): string {
  return `${ROUTES.admin.customers}/${customerId}`;
}

export function orderNewPath(userId?: number): string {
  if (userId == null || !Number.isFinite(userId) || userId <= 0) {
    return ROUTES.admin.orderNew;
  }
  return `${ROUTES.admin.orderNew}?userId=${userId}`;
}

export {
  decodeAdminRouteKey,
  encodeAdminRouteKey,
  getCouponRouteKey,
  getOrderRouteKey,
  getPrescriptionRouteKey,
  getProductRouteKey,
  getPromotionRouteKey,
  isNumericAdminRouteKey,
};

/** Unfinished routes only. Every Phase 1 module has a real page and is not listed here. */
export const ADMIN_PLACEHOLDER_ROUTES = [] as const;
