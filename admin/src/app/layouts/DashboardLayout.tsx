import { type ReactNode, useCallback, useEffect, useState } from "react";
import { Outlet, useLocation, useNavigation } from "react-router";

import { RouteSuspense } from "@/app/components/RouteSuspense";
import { adminNavigation, designSystemNavItem } from "@/app/config/navigation";
import { AdminHeader } from "@/app/layouts/AdminHeader";
import { AdminSidebar } from "@/app/layouts/AdminSidebar";
import { ROUTES } from "@/app/router/routes";
import { LoadingState } from "@/shared/components";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/shared/design-system/components/ui/sheet";
import { useIsMobile } from "@/shared/design-system/components/ui/use-mobile";
import {
  useLocalization,
  useTranslation,
} from "@/shared/design-system/localization/contexts/LocalizationContext";

const SIDEBAR_COLLAPSED_KEY = "parkour-admin-sidebar-collapsed";

function readStoredSidebarCollapsed(): boolean | null {
  try {
    const raw = window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (raw === "true") return true;
    if (raw === "false") return false;
  } catch {
    // localStorage may be unavailable
  }
  return null;
}

function writeStoredSidebarCollapsed(collapsed: boolean) {
  try {
    window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed));
  } catch {
    // ignore quota / privacy mode
  }
}

function defaultSidebarCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  return readStoredSidebarCollapsed() ?? false;
}

function resolvePageTitle(pathname: string, t: ReturnType<typeof useTranslation>) {
  if (pathname === ROUTES.admin.productNew || pathname.endsWith("/products/new")) {
    return t.addProduct;
  }
  if (/\/admin\/products\/[^/]+\/edit\/?$/.test(pathname)) {
    return t.editProduct;
  }
  if (/\/admin\/products\/[^/]+\/?$/.test(pathname)) {
    return t.viewProduct;
  }
  if (pathname === ROUTES.admin.couponNew || pathname.endsWith("/coupons/new")) {
    return t.addCoupon;
  }
  if (/\/admin\/coupons\/[^/]+\/edit\/?$/.test(pathname)) {
    return t.editCoupon;
  }
  if (/\/admin\/coupons\/[^/]+\/?$/.test(pathname)) {
    return t.viewCoupon;
  }
  if (pathname === ROUTES.admin.promotionNew || pathname.endsWith("/promotions/new")) {
    return t.addPromotion;
  }
  if (/\/admin\/promotions\/[^/]+\/edit\/?$/.test(pathname)) {
    return t.editPromotion;
  }
  if (/\/admin\/promotions\/[^/]+\/?$/.test(pathname)) {
    return t.viewPromotion;
  }
  if (pathname === ROUTES.admin.orderNew || pathname.endsWith("/orders/new")) {
    return t.addOrder;
  }
  if (/\/admin\/orders\/[^/]+\/edit\/?$/.test(pathname)) {
    return t.editOrder;
  }
  if (/\/admin\/orders\/[^/]+\/?$/.test(pathname)) {
    return t.viewOrder;
  }
  if (pathname === ROUTES.admin.carePlanNew || pathname.endsWith("/care-plans/new")) {
    return t.addCarePlan;
  }
  if (/\/admin\/care-plans\/\d+\/edit\/?$/.test(pathname)) {
    return t.editCarePlan;
  }
  if (/\/admin\/care-plans\/\d+\/?$/.test(pathname)) {
    return t.viewCarePlan;
  }
  if (pathname === ROUTES.admin.prescriptionNew || pathname.endsWith("/prescriptions/new")) {
    return t.addPrescription;
  }
  if (/\/admin\/prescriptions\/[^/]+\/edit\/?$/.test(pathname)) {
    return t.editPrescription;
  }
  if (/\/admin\/prescriptions\/[^/]+\/?$/.test(pathname)) {
    return t.viewPrescription;
  }
  const allItems = [...adminNavigation, designSystemNavItem];
  const match = allItems.find((item) =>
    item.href === ROUTES.admin.root
      ? pathname === ROUTES.admin.root
      : pathname.startsWith(item.href),
  );
  return match ? t[match.labelKey] : t.adminDashboard;
}

type DashboardLayoutProps = {
  userMenu?: ReactNode;
};

export function DashboardLayout({ userMenu }: DashboardLayoutProps) {
  const t = useTranslation();
  const { direction } = useLocalization();
  const location = useLocation();
  const navigation = useNavigation();
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(defaultSidebarCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);

  const pageTitle = resolvePageTitle(
    navigation.location?.pathname ?? location.pathname,
    t,
  );
  const isRoutePending =
    navigation.state === "loading" &&
    Boolean(navigation.location) &&
    navigation.location?.pathname !== location.pathname;
  const sheetSide = direction === "rtl" ? "right" : "left";

  useEffect(() => {
    document.title = `${pageTitle} — ${t.adminDocumentTitleSuffix}`;
  }, [pageTitle, t.adminDocumentTitleSuffix]);

  const handleCollapsedChange = useCallback((next: boolean) => {
    setCollapsed(next);
    writeStoredSidebarCollapsed(next);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {!isMobile ? (
        <AdminSidebar collapsed={collapsed} onCollapsedChange={handleCollapsedChange} />
      ) : null}

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side={sheetSide} className="w-[min(100%,20rem)] p-0 sm:max-w-none">
          <SheetHeader className="sr-only">
            <SheetTitle>{t.adminPanel}</SheetTitle>
          </SheetHeader>
          <AdminSidebar
            collapsed={false}
            onCollapsedChange={() => undefined}
            onNavigate={() => setMobileOpen(false)}
            hideCollapseButton
            className="w-full border-0"
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <AdminHeader
          title={pageTitle}
          showMenuButton={isMobile}
          onMenuClick={() => setMobileOpen(true)}
          userMenu={userMenu}
        />
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          {isRoutePending ? (
            <LoadingState label={t.loadingMessage} className="min-h-[50vh]" />
          ) : (
            <RouteSuspense>
              <Outlet />
            </RouteSuspense>
          )}
        </main>
      </div>
    </div>
  );
}
