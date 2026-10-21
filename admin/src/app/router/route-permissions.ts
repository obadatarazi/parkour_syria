import { ROUTES } from "@/app/router/routes";
import { type Permission,PERMISSIONS } from "@/shared/constants/permissions";
import { env } from "@/shared/lib/env";

export type RoutePermissionRule = Permission | Permission[];

/**
 * Parkour Phase 1. Settings, users and roles are SuperAdmin-only because only that role holds their
 * permissions (backend PermissionType::SUPERVISOR_SECTIONS); the Supervisor gets the content ones.
 */
const PARKOUR_ROUTE_PERMISSIONS: Record<string, RoutePermissionRule> = {
  [ROUTES.admin.pages]: PERMISSIONS.MANAGE_PAGE,
  [ROUTES.admin.book]: PERMISSIONS.MANAGE_PAGE,
  [ROUTES.admin.homepage]: PERMISSIONS.MANAGE_SLIDER,
  [ROUTES.admin.sliders]: PERMISSIONS.MANAGE_SLIDER,
  [ROUTES.admin.lessons]: PERMISSIONS.MANAGE_LESSON,
  [ROUTES.admin.areas]: PERMISSIONS.MANAGE_AREA,
  [ROUTES.admin.directoryEntries]: PERMISSIONS.MANAGE_DIRECTORY_ENTRY,
  [ROUTES.admin.events]: PERMISSIONS.MANAGE_EVENT,
  [ROUTES.admin.suggestions]: PERMISSIONS.MANAGE_SUGGESTION,
  [ROUTES.admin.blogPosts]: PERMISSIONS.MANAGE_BLOG_POST,
  [ROUTES.admin.blogCategories]: PERMISSIONS.MANAGE_BLOG_CATEGORY,
  [ROUTES.admin.galleryImages]: PERMISSIONS.MANAGE_GALLERY_IMAGE,
  [ROUTES.admin.settings]: PERMISSIONS.MANAGE_MULTI_TYPE_SETTING,
  [ROUTES.admin.users]: PERMISSIONS.MANAGE_USER,
  [ROUTES.admin.roles]: PERMISSIONS.MANAGE_ROLE,
};

/** The dormant shop, mirrored from backend PermissionType::SHOP_SECTIONS. */
const SHOP_ROUTE_PERMISSIONS: Record<string, RoutePermissionRule> = {
  [ROUTES.admin.orders]: PERMISSIONS.MANAGE_ORDER,
  [ROUTES.admin.orderNew]: PERMISSIONS.MANAGE_ORDER,
  [ROUTES.admin.products]: PERMISSIONS.MANAGE_PRODUCT,
  [ROUTES.admin.productNew]: PERMISSIONS.MANAGE_PRODUCT,
  [ROUTES.admin.categories]: PERMISSIONS.MANAGE_CATEGORY,
  [ROUTES.admin.brands]: PERMISSIONS.MANAGE_BRAND,
  [ROUTES.admin.tags]: PERMISSIONS.MANAGE_TAG,
  [ROUTES.admin.currencies]: PERMISSIONS.MANAGE_CURRENCY,
  [ROUTES.admin.coupons]: PERMISSIONS.MANAGE_COUPON,
  [ROUTES.admin.couponNew]: PERMISSIONS.MANAGE_COUPON,
  [ROUTES.admin.carts]: PERMISSIONS.MANAGE_CART,
};

/**
 * Single source of truth for admin route authorization.
 *
 * - Entries here are enforced by `ProtectedRoute` (URL access).
 * - Navigation visibility must be derived via `getRouteNavAccess` so sidebar
 *   gates cannot diverge from route gates.
 * - Routes absent from this map require authentication only.
 */
export const ROUTE_PERMISSIONS: Record<string, RoutePermissionRule> = {
  ...PARKOUR_ROUTE_PERMISSIONS,
  ...(env.features.ecommerce ? SHOP_ROUTE_PERMISSIONS : {}),
};

export type RouteNavAccess = {
  permission?: Permission;
  permissions?: Permission[];
};

/** Map a route permission rule into the nav item `permission` / `permissions` shape. */
export function getRouteNavAccess(href: string): RouteNavAccess {
  const rule = ROUTE_PERMISSIONS[href];
  if (!rule) return {};
  if (Array.isArray(rule)) {
    return { permissions: rule };
  }
  return { permission: rule };
}

export function resolveRoutePermission(pathname: string): RoutePermissionRule | null {
  const normalized = pathname.replace(/\/$/, "") || "/";
  const exact = ROUTE_PERMISSIONS[normalized];
  if (exact) return exact;

  const prefixMatch = Object.keys(ROUTE_PERMISSIONS)
    .sort((left, right) => right.length - left.length)
    .find((route) => normalized.startsWith(`${route}/`));

  return prefixMatch ? ROUTE_PERMISSIONS[prefixMatch] : null;
}
