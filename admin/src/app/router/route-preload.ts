import {
  LazyAreasPage,
  LazyBlogCategoriesPage,
  LazyBlogPostsPage,
  LazyBrandsPage,
  LazyCartsPage,
  LazyCategoriesPage,
  LazyCouponsPage,
  LazyCurrenciesPage,
  LazyDesignSystemPage,
  LazyDirectoryEntriesPage,
  LazyEventsPage,
  LazyGalleryImagesPage,
  LazyHomepageCmsPage,
  LazyLessonsPage,
  LazyOrdersPage,
  LazyPagesPage,
  LazyParkourDashboardPage,
  LazyProductsPage,
  LazyRolesPage,
  LazySettingsPage,
  LazySuggestionsPage,
  LazyTagsPage,
  LazyUsersPage,
  preloadLazyPage,
} from "@/app/router/lazy-pages";
import { ROUTES } from "@/app/router/routes";

const NAV_PAGE_PRELOADERS: Record<string, () => void> = {
  [ROUTES.admin.root]: () => preloadLazyPage(LazyParkourDashboardPage),
  [ROUTES.admin.pages]: () => preloadLazyPage(LazyPagesPage),
  [ROUTES.admin.book]: () => preloadLazyPage(LazyPagesPage),
  [ROUTES.admin.homepage]: () => preloadLazyPage(LazyHomepageCmsPage),
  [ROUTES.admin.lessons]: () => preloadLazyPage(LazyLessonsPage),
  [ROUTES.admin.areas]: () => preloadLazyPage(LazyAreasPage),
  [ROUTES.admin.directoryEntries]: () => preloadLazyPage(LazyDirectoryEntriesPage),
  [ROUTES.admin.events]: () => preloadLazyPage(LazyEventsPage),
  [ROUTES.admin.suggestions]: () => preloadLazyPage(LazySuggestionsPage),
  [ROUTES.admin.blogPosts]: () => preloadLazyPage(LazyBlogPostsPage),
  [ROUTES.admin.blogCategories]: () => preloadLazyPage(LazyBlogCategoriesPage),
  [ROUTES.admin.galleryImages]: () => preloadLazyPage(LazyGalleryImagesPage),
  [ROUTES.admin.settings]: () => preloadLazyPage(LazySettingsPage),
  [ROUTES.admin.users]: () => preloadLazyPage(LazyUsersPage),
  [ROUTES.admin.roles]: () => preloadLazyPage(LazyRolesPage),
  [ROUTES.admin.orders]: () => preloadLazyPage(LazyOrdersPage),
  [ROUTES.admin.products]: () => preloadLazyPage(LazyProductsPage),
  [ROUTES.admin.categories]: () => preloadLazyPage(LazyCategoriesPage),
  [ROUTES.admin.brands]: () => preloadLazyPage(LazyBrandsPage),
  [ROUTES.admin.tags]: () => preloadLazyPage(LazyTagsPage),
  [ROUTES.admin.coupons]: () => preloadLazyPage(LazyCouponsPage),
  [ROUTES.admin.carts]: () => preloadLazyPage(LazyCartsPage),
  [ROUTES.admin.currencies]: () => preloadLazyPage(LazyCurrenciesPage),
  [ROUTES.admin.designSystem]: () => preloadLazyPage(LazyDesignSystemPage),
};

/** Warm the lazy chunk for a sidebar destination so navigation can paint sooner. */
export function preloadAdminRoute(href: string): void {
  NAV_PAGE_PRELOADERS[href]?.();
}
