import type { ComponentType } from "react";
import { Navigate, type RouteObject } from "react-router";

import { RouteSuspense } from "@/app/components/RouteSuspense";
import { AdminDashboardLayout } from "@/app/layouts/AdminDashboardLayout";
import { ProtectedRoute } from "@/app/router/guards/ProtectedRoute";
import {
  LazyAreasPage,
  LazyBlogCategoriesPage,
  LazyBlogPostsPage,
  LazyBrandsPage,
  LazyCartsPage,
  LazyCategoriesPage,
  LazyCouponFormPage,
  LazyCouponsPage,
  LazyCouponViewPage,
  LazyCurrenciesPage,
  LazyDesignSystemPage,
  LazyDirectoryEntriesPage,
  LazyEventsPage,
  LazyGalleryImagesPage,
  LazyHomepageCmsPage,
  LazyLessonsPage,
  LazyOrderFormPage,
  LazyOrdersPage,
  LazyOrderViewPage,
  LazyPagesPage,
  LazyParkourDashboardPage,
  LazyProductFormPage,
  LazyProductsPage,
  LazyProductViewPage,
  LazyProfilePage,
  LazyRolesPage,
  LazySettingsPage,
  LazySuggestionsPage,
  LazyTagsPage,
  LazyUsersPage,
} from "@/app/router/lazy-pages";
import { ROUTES } from "@/app/router/routes";
import { env } from "@/shared/lib/env";

function lazyElement(Page: ComponentType) {
  return (
    <RouteSuspense>
      <Page />
    </RouteSuspense>
  );
}

function page(path: string, Page: ComponentType): RouteObject {
  return { path, element: lazyElement(Page) };
}

/** List + `new` + `:key/edit` + `:key` for a record-workspace feature. */
function workspace(
  path: string,
  keyParam: string,
  ListPage: ComponentType,
  FormPage: ComponentType,
  ViewPage: ComponentType,
): RouteObject {
  return {
    path,
    children: [
      { index: true, element: lazyElement(ListPage) },
      { path: "new", element: lazyElement(FormPage) },
      { path: `:${keyParam}/edit`, element: lazyElement(FormPage) },
      { path: `:${keyParam}`, element: lazyElement(ViewPage) },
    ],
  };
}

/** Parkour Syria Phase 1. */
const parkourRoutes: RouteObject[] = [
  { index: true, element: lazyElement(LazyParkourDashboardPage) },
  page("pages", LazyPagesPage),
  { path: "book", element: <Navigate to={`${ROUTES.admin.pages}?key=book`} replace /> },
  page("homepage", LazyHomepageCmsPage),
  { path: "sliders", element: <Navigate to={ROUTES.admin.homepage} replace /> },
  page("lessons", LazyLessonsPage),
  page("areas", LazyAreasPage),
  page("directory-entries", LazyDirectoryEntriesPage),
  page("events", LazyEventsPage),
  page("suggestions", LazySuggestionsPage),
  page("blog-posts", LazyBlogPostsPage),
  page("blog-categories", LazyBlogCategoriesPage),
  page("gallery-images", LazyGalleryImagesPage),
  page("settings", LazySettingsPage),
  page("users", LazyUsersPage),
  page("roles", LazyRolesPage),
  page("profile", LazyProfilePage),
];

/**
 * The dormant shop, registered only with VITE_FEATURE_ECOMMERCE=true (the backend registers its
 * API under FEATURE_ECOMMERCE). Aroma's pharmacy-only features (care plans, prescriptions,
 * loyalty, WhatsApp templates, payment providers, ...) are on disk but never routed.
 */
const shopRoutes: RouteObject[] = [
  workspace("orders", "orderKey", LazyOrdersPage, LazyOrderFormPage, LazyOrderViewPage),
  workspace("products", "productKey", LazyProductsPage, LazyProductFormPage, LazyProductViewPage),
  workspace("coupons", "couponKey", LazyCouponsPage, LazyCouponFormPage, LazyCouponViewPage),
  page("categories", LazyCategoriesPage),
  page("brands", LazyBrandsPage),
  page("tags", LazyTagsPage),
  page("currencies", LazyCurrenciesPage),
  page("carts", LazyCartsPage),
];

const developerRoutes: RouteObject[] = import.meta.env.DEV
  ? [page("design-system", LazyDesignSystemPage)]
  : [];

export const protectedRoutes: RouteObject[] = [
  {
    path: "admin",
    element: (
      <ProtectedRoute>
        <AdminDashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      ...parkourRoutes,
      ...(env.features.ecommerce ? shopRoutes : []),
      ...developerRoutes,
    ],
  },
];
