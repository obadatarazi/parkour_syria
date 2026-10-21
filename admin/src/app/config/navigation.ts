/** Admin sidebar navigation — keep in sync with protected routes. */
import {
  BookMarked,
  BookOpen,
  CalendarDays,
  ClipboardList,
  Coins,
  FileText,
  FolderTree,
  GraduationCap,
  Grid3X3,
  Image,
  KeyRound,
  LayoutDashboard,
  Lightbulb,
  type LucideIcon,
  MapPin,
  MapPinned,
  Package,
  PanelTop,
  Settings,
  Shield,
  ShoppingCart,
  Tag,
  Tags,
  TicketPercent,
  Zap,
} from "lucide-react";

import { ROUTES } from "@/app/router/routes";
import type { Permission } from "@/shared/constants/permissions";
import { getRouteNavAccess } from "@/shared/constants/routePermissions";
import type { Translation } from "@/shared/design-system/localization/locales/en";
import { env } from "@/shared/lib/env";

export type NavItem = {
  id: string;
  labelKey: keyof Translation;
  href: string;
  icon: LucideIcon;
  badge?: number;
  /** Nested under a parent item visually (e.g. Categories under Posts). */
  indent?: boolean;
  /** Single permission gate (used when `permissions` is not set). */
  permission?: Permission;
  /** User needs any one of these permissions to see the item. */
  permissions?: Permission[];
  variant?: "default" | "accent";
};

export type NavSection = {
  id: string;
  labelKey: keyof Translation;
  items: NavItem[];
};

function navItem(
  id: string,
  labelKey: keyof Translation,
  href: string,
  icon: LucideIcon,
  extra: Partial<NavItem> = {},
): NavItem {
  return { id, labelKey, href, icon, ...getRouteNavAccess(href), ...extra };
}

export const designSystemNavItem: NavItem = {
  id: "design-system",
  labelKey: "designSystem",
  href: ROUTES.admin.designSystem,
  icon: Zap,
  variant: "accent",
};

const parkourSections: NavSection[] = [
  {
    id: "home",
    labelKey: "navSectionHome",
    items: [navItem("dashboard", "dashboard", ROUTES.admin.root, LayoutDashboard)],
  },
  {
    id: "content",
    labelKey: "navSectionContent",
    items: [
      navItem("homepage", "navHomepage", ROUTES.admin.homepage, PanelTop),
      navItem("pages", "navPages", ROUTES.admin.pages, FileText),
      navItem("book", "navBook", ROUTES.admin.book, BookMarked, { indent: true }),
      navItem("lessons", "navLessons", ROUTES.admin.lessons, GraduationCap),
      navItem("gallery-images", "navGallery", ROUTES.admin.galleryImages, Image),
    ],
  },
  {
    id: "community",
    labelKey: "navSectionCommunity",
    items: [
      navItem("suggestions", "navSuggestions", ROUTES.admin.suggestions, Lightbulb),
      navItem("directory-entries", "navDirectory", ROUTES.admin.directoryEntries, MapPinned),
      navItem("events", "navEvents", ROUTES.admin.events, CalendarDays),
      navItem("areas", "navAreas", ROUTES.admin.areas, MapPin, { indent: true }),
    ],
  },
  {
    id: "blog",
    labelKey: "navSectionBlog",
    items: [
      navItem("blog-posts", "navBlogPosts", ROUTES.admin.blogPosts, BookOpen),
      navItem("blog-categories", "navBlogCategories", ROUTES.admin.blogCategories, FolderTree, {
        indent: true,
      }),
    ],
  },
  {
    id: "settings",
    labelKey: "navSectionSettings",
    items: [
      navItem("settings", "settings", ROUTES.admin.settings, Settings),
      navItem("users", "staff", ROUTES.admin.users, Shield),
      navItem("roles", "userRoles", ROUTES.admin.roles, KeyRound),
    ],
  },
];

/** The dormant shop, shown only with VITE_FEATURE_ECOMMERCE=true. */
const shopSection: NavSection = {
  id: "shop",
  labelKey: "navSectionShop",
  items: [
    navItem("orders", "orders", ROUTES.admin.orders, ClipboardList),
    navItem("products", "products2", ROUTES.admin.products, Package),
    navItem("categories", "categories", ROUTES.admin.categories, Grid3X3, { indent: true }),
    navItem("brands", "brands", ROUTES.admin.brands, Tag, { indent: true }),
    navItem("tags", "tags", ROUTES.admin.tags, Tags, { indent: true }),
    navItem("coupons", "coupons", ROUTES.admin.coupons, TicketPercent),
    navItem("carts", "carts", ROUTES.admin.carts, ShoppingCart),
    navItem("currencies", "currencies", ROUTES.admin.currencies, Coins),
  ],
};

export const adminNavigationSections: NavSection[] = [
  ...parkourSections,
  ...(env.features.ecommerce ? [shopSection] : []),
  ...(import.meta.env.DEV
    ? [{ id: "developer", labelKey: "navSectionDeveloper" as const, items: [designSystemNavItem] }]
    : []),
];

export const adminNavigation: NavItem[] = adminNavigationSections
  .flatMap((section) => section.items)
  .filter((item) => item.id !== designSystemNavItem.id);
