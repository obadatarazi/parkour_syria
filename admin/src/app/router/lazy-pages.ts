import { type ComponentType, lazy, type LazyExoticComponent } from "react";

type PreloadableLazyComponent = LazyExoticComponent<ComponentType> & {
  preload: () => Promise<void>;
};

/** Lazy-load a named page export without pulling the feature barrel (forms/maps/etc.). */
function lazyPage<T extends Record<string, unknown>>(
  loader: () => Promise<T>,
  exportName: keyof T & string,
): PreloadableLazyComponent {
  let pending: Promise<{ default: ComponentType }> | null = null;

  const load = () => {
    if (!pending) {
      pending = loader().then((module) => {
        const Page = module[exportName];
        if (typeof Page !== "function") {
          throw new Error(`Lazy page export "${exportName}" is not a component`);
        }
        return { default: Page as ComponentType };
      });
    }
    return pending;
  };

  const LazyComponent = lazy(load) as PreloadableLazyComponent;
  LazyComponent.preload = () => load().then(() => undefined);
  return LazyComponent;
}

export function preloadLazyPage(page: PreloadableLazyComponent): void {
  void page.preload();
}

export const LazyLoginPage = lazyPage(
  () => import("@/features/auth/pages/LoginPage"),
  "LoginPage",
);

export const LazyForgotPasswordPage = lazyPage(
  () => import("@/features/auth/pages/ForgotPasswordPage"),
  "ForgotPasswordPage",
);

export const LazyResetPasswordPage = lazyPage(
  () => import("@/features/auth/pages/ResetPasswordPage"),
  "ResetPasswordPage",
);

export const LazyDashboardHomePage = lazyPage(
  () => import("@/features/dashboard/pages/DashboardHomePage"),
  "DashboardHomePage",
);

export const LazyOrdersPage = lazyPage(
  () => import("@/features/orders/pages/OrdersPage"),
  "OrdersPage",
);

export const LazyOrderFormPage = lazyPage(
  () => import("@/features/orders/pages/OrderFormPage"),
  "OrderFormPage",
);

export const LazyOrderViewPage = lazyPage(
  () => import("@/features/orders/pages/OrderViewPage"),
  "OrderViewPage",
);

export const LazyInvoicesPage = lazyPage(
  () => import("@/features/invoices/pages/InvoicesPage"),
  "InvoicesPage",
);

export const LazyOrderItemsPage = lazyPage(
  () => import("@/features/order-items/pages/OrderItemsPage"),
  "OrderItemsPage",
);

export const LazyProductsPage = lazyPage(
  () => import("@/features/products/pages/ProductsPage"),
  "ProductsPage",
);

export const LazyProductFormPage = lazyPage(
  () => import("@/features/products/pages/ProductFormPage"),
  "ProductFormPage",
);

export const LazyProductViewPage = lazyPage(
  () => import("@/features/products/pages/ProductViewPage"),
  "ProductViewPage",
);

export const LazyProductReviewsPage = lazyPage(
  () => import("@/features/product-reviews/pages/ProductReviewsPage"),
  "ProductReviewsPage",
);

export const LazyBrandsPage = lazyPage(
  () => import("@/features/brands/pages/BrandsPage"),
  "BrandsPage",
);

export const LazyCountriesPage = lazyPage(
  () => import("@/features/countries/pages/CountriesPage"),
  "CountriesPage",
);

export const LazyStatesPage = lazyPage(
  () => import("@/features/states/pages/StatesPage"),
  "StatesPage",
);

export const LazyCurrenciesPage = lazyPage(
  () => import("@/features/currencies/pages/CurrenciesPage"),
  "CurrenciesPage",
);

export const LazyPaymentProvidersPage = lazyPage(
  () => import("@/features/payment-providers/pages/PaymentProvidersPage"),
  "PaymentProvidersPage",
);

export const LazyDeliveryZonesPricesPage = lazyPage(
  () => import("@/features/delivery-zones-prices/pages/DeliveryZonesPricesPage"),
  "DeliveryZonesPricesPage",
);

export const LazyHolidaysPage = lazyPage(
  () => import("@/features/holidays/pages/HolidaysPage"),
  "HolidaysPage",
);

export const LazyTagsPage = lazyPage(
  () => import("@/features/tags/pages/TagsPage"),
  "TagsPage",
);

export const LazyTrendingSearchesPage = lazyPage(
  () => import("@/features/trending-searches/pages/TrendingSearchesPage"),
  "TrendingSearchesPage",
);

export const LazyLoyaltyEventsPage = lazyPage(
  () => import("@/features/loyalty-events/pages/LoyaltyEventsPage"),
  "LoyaltyEventsPage",
);

export const LazyLoyaltyRewardsPage = lazyPage(
  () => import("@/features/loyalty-rewards/pages/LoyaltyRewardsPage"),
  "LoyaltyRewardsPage",
);

export const LazyLoyaltyRedemptionsPage = lazyPage(
  () => import("@/features/loyalty-redemptions/pages/LoyaltyRedemptionsPage"),
  "LoyaltyRedemptionsPage",
);

export const LazyLoyaltyLedgerPage = lazyPage(
  () => import("@/features/loyalty-ledger/pages/LoyaltyLedgerPage"),
  "LoyaltyLedgerPage",
);

export const LazyAttributesPage = lazyPage(
  () => import("@/features/attributes/pages/AttributesPage"),
  "AttributesPage",
);

export const LazyAttributeValuesPage = lazyPage(
  () => import("@/features/attribute-values/pages/AttributeValuesPage"),
  "AttributeValuesPage",
);

export const LazyUsersPage = lazyPage(
  () => import("@/features/users/pages/UsersPage"),
  "UsersPage",
);

export const LazyProfilePage = lazyPage(
  () => import("@/features/profile/pages/ProfilePage"),
  "ProfilePage",
);

export const LazyCategoriesPage = lazyPage(
  () => import("@/features/categories/pages/CategoriesPage"),
  "CategoriesPage",
);

export const LazyCustomersPage = lazyPage(
  () => import("@/features/customers/pages/CustomersPage"),
  "CustomersPage",
);

export const LazyCustomerCrmPage = lazyPage(
  () => import("@/features/customers/pages/CustomerCrmPage"),
  "CustomerCrmPage",
);

export const LazyPrescriptionsPage = lazyPage(
  () => import("@/features/prescriptions/pages/PrescriptionsPage"),
  "PrescriptionsPage",
);

export const LazyPrescriptionFormPage = lazyPage(
  () => import("@/features/prescriptions/pages/PrescriptionFormPage"),
  "PrescriptionFormPage",
);

export const LazyPrescriptionViewPage = lazyPage(
  () => import("@/features/prescriptions/pages/PrescriptionViewPage"),
  "PrescriptionViewPage",
);

export const LazyInventoryPage = lazyPage(
  () => import("@/features/inventory/pages/InventoryPage"),
  "InventoryPage",
);

export const LazyPromotionsPage = lazyPage(
  () => import("@/features/promotions/pages/PromotionsPage"),
  "PromotionsPage",
);

export const LazyPromotionFormPage = lazyPage(
  () => import("@/features/promotions/pages/PromotionFormPage"),
  "PromotionFormPage",
);

export const LazyPromotionViewPage = lazyPage(
  () => import("@/features/promotions/pages/PromotionViewPage"),
  "PromotionViewPage",
);

export const LazyPromotionUsagesPage = lazyPage(
  () => import("@/features/promotions/pages/PromotionUsagesPage"),
  "PromotionUsagesPage",
);

export const LazyCartsPage = lazyPage(
  () => import("@/features/carts/pages/CartsPage"),
  "CartsPage",
);

export const LazyHomepageCmsPage = lazyPage(
  () => import("@/features/homepage/pages/HomepageCmsPage"),
  "HomepageCmsPage",
);

export const LazySlidersPage = lazyPage(
  () => import("@/features/sliders/pages/SlidersPage"),
  "SlidersPage",
);

export const LazySliderPromotionsPage = lazyPage(
  () => import("@/features/slider-promotions/pages/SliderPromotionsPage"),
  "SliderPromotionsPage",
);

export const LazyStaticPromotionsPage = lazyPage(
  () => import("@/features/static-promotions/pages/StaticPromotionsPage"),
  "StaticPromotionsPage",
);

export const LazyCouponsPage = lazyPage(
  () => import("@/features/coupons/pages/CouponsPage"),
  "CouponsPage",
);

export const LazyCouponFormPage = lazyPage(
  () => import("@/features/coupons/pages/CouponFormPage"),
  "CouponFormPage",
);

export const LazyCouponViewPage = lazyPage(
  () => import("@/features/coupons/pages/CouponViewPage"),
  "CouponViewPage",
);

export const LazyCarePlansPage = lazyPage(
  () => import("@/features/care-plans/pages/CarePlansPage"),
  "CarePlansPage",
);

export const LazyCarePlanFormPage = lazyPage(
  () => import("@/features/care-plans/pages/CarePlanFormPage"),
  "CarePlanFormPage",
);

export const LazyCarePlanViewPage = lazyPage(
  () => import("@/features/care-plans/pages/CarePlanViewPage"),
  "CarePlanViewPage",
);

export const LazyNotificationsPage = lazyPage(
  () => import("@/features/notifications/pages/NotificationsPage"),
  "NotificationsPage",
);

export const LazyNotificationRoutesPage = lazyPage(
  () => import("@/features/notification-routes/pages/NotificationRoutesPage"),
  "NotificationRoutesPage",
);

export const LazyWhatsAppTemplatesPage = lazyPage(
  () => import("@/features/whatsapp-templates/pages/WhatsAppTemplatesPage"),
  "WhatsAppTemplatesPage",
);

export const LazyPlatformNotificationsPage = lazyPage(
  () => import("@/features/notifications/pages/PlatformNotificationsPage"),
  "PlatformNotificationsPage",
);

export const LazyReportsPage = lazyPage(
  () => import("@/features/reports/pages/ReportsPage"),
  "ReportsPage",
);

export const LazySettingsPage = lazyPage(
  () => import("@/features/settings/pages/SettingsPage"),
  "SettingsPage",
);

export const LazyVisualSettingsPage = lazyPage(
  () => import("@/features/visual-settings/pages/VisualSettingsPage"),
  "VisualSettingsPage",
);

export const LazyContactUsPage = lazyPage(
  () => import("@/features/contact-us/pages/ContactUsPage"),
  "ContactUsPage",
);

export const LazyRolesPage = lazyPage(
  () => import("@/features/roles/pages/RolesPage"),
  "RolesPage",
);

export const LazyDesignSystemPage = lazyPage(
  () => import("@/features/design-system/pages/DesignSystemPage"),
  "DesignSystemPage",
);

// Parkour Syria Phase 1

export const LazyParkourDashboardPage = lazyPage(
  () => import("@/features/dashboard/pages/ParkourDashboardPage"),
  "ParkourDashboardPage",
);

export const LazyPagesPage = lazyPage(() => import("@/features/pages/pages/PagesPage"), "PagesPage");

export const LazyLessonsPage = lazyPage(
  () => import("@/features/lessons/pages/LessonsPage"),
  "LessonsPage",
);

export const LazyAreasPage = lazyPage(() => import("@/features/areas/pages/AreasPage"), "AreasPage");

export const LazyDirectoryEntriesPage = lazyPage(
  () => import("@/features/directory-entries/pages/DirectoryEntriesPage"),
  "DirectoryEntriesPage",
);

export const LazyEventsPage = lazyPage(
  () => import("@/features/events/pages/EventsPage"),
  "EventsPage",
);

export const LazySuggestionsPage = lazyPage(
  () => import("@/features/suggestions/pages/SuggestionsPage"),
  "SuggestionsPage",
);

export const LazyBlogPostsPage = lazyPage(
  () => import("@/features/blog-posts/pages/BlogPostsPage"),
  "BlogPostsPage",
);

export const LazyBlogCategoriesPage = lazyPage(
  () => import("@/features/blog-categories/pages/BlogCategoriesPage"),
  "BlogCategoriesPage",
);

export const LazyGalleryImagesPage = lazyPage(
  () => import("@/features/gallery-images/pages/GalleryImagesPage"),
  "GalleryImagesPage",
);
