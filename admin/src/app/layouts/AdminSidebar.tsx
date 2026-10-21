import {
  ChevronRight,
  ExternalLink,
  PanelLeftClose,
  PanelLeftOpen,
  Shield,
} from "lucide-react";
import { useMemo } from "react";
import { NavLink } from "react-router";

import { adminNavigationSections, type NavItem } from "@/app/config/navigation";
import { preloadAdminRoute } from "@/app/router/route-preload";
import { ROUTES } from "@/app/router/routes";
import { canAccessNavItem, useAbility } from "@/features/auth";
import { useOrderNeedsActionCount } from "@/features/orders/hooks/use-order-needs-action-count";
import { CaptionText, CardTitleText } from "@/shared/components";
import { Button } from "@/shared/design-system/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/design-system/components/ui/tooltip";
import { cn } from "@/shared/design-system/components/ui/utils";
import {
  useLocalization,
  useTranslation,
} from "@/shared/design-system/localization/contexts/LocalizationContext";
import { env } from "@/shared/lib/env";

type AdminSidebarProps = {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  onNavigate?: () => void;
  hideCollapseButton?: boolean;
  className?: string;
};

type SidebarNavItemProps = {
  item: NavItem;
  collapsed: boolean;
  onNavigate?: () => void;
  label: string;
  tooltipSide: "left" | "right";
};

function formatNavBadge(count: number): string {
  return count > 99 ? "99+" : String(count);
}

function SidebarNavItem({
  item,
  collapsed,
  onNavigate,
  label,
  tooltipSide,
}: SidebarNavItemProps) {
  const Icon = item.icon;
  const isAccent = item.variant === "accent";
  const badgeLabel =
    item.badge && item.badge > 0 ? formatNavBadge(item.badge) : null;

  const link = (
    <NavLink
      to={item.href}
      end={item.href === ROUTES.admin.root}
      onClick={onNavigate}
      onMouseEnter={() => preloadAdminRoute(item.href)}
      onFocus={() => preloadAdminRoute(item.href)}
      aria-label={collapsed ? label : undefined}
      data-guidance={`nav-${item.id}`}
      className={({ isActive }) =>
        cn(
          "group relative flex w-full min-w-0 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
          item.indent && !collapsed && "ms-2 border-s border-border/60 ps-2.5",
          collapsed && "justify-center px-2",
          isAccent
            ? isActive
              ? "bg-accent-brand text-accent-brand-foreground"
              : "bg-transparent text-muted-foreground hover:bg-brand-muted hover:text-brand"
            : isActive
              ? "bg-brand text-brand-foreground"
              : "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={cn(
              "size-[18px] shrink-0",
              isActive ? "text-current" : "text-muted-foreground group-hover:text-foreground",
            )}
            aria-hidden="true"
          />
          {!collapsed ? (
            <>
              <span className="flex-1 truncate text-start">{label}</span>
              {badgeLabel ? (
                <span
                  className={cn(
                    "flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[9px] font-bold",
                    isActive
                      ? "bg-card text-brand"
                      : "bg-brand text-brand-foreground",
                  )}
                  aria-label={`${badgeLabel} ${label}`}
                >
                  {badgeLabel}
                </span>
              ) : null}
            </>
          ) : null}
          {collapsed && badgeLabel ? (
            <span
              className="absolute end-1 top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-destructive px-0.5 text-[7px] font-bold text-destructive-foreground"
              aria-hidden="true"
            >
              {badgeLabel}
            </span>
          ) : null}
        </>
      )}
    </NavLink>
  );

  if (!collapsed) return link;

  // Wrapper div keeps NavLink className (function) intact — asChild on NavLink breaks active styles.
  return (
    <Tooltip delayDuration={150}>
      <TooltipTrigger asChild>
        <div className="w-full">{link}</div>
      </TooltipTrigger>
      <TooltipContent side={tooltipSide} sideOffset={10}>
        {badgeLabel ? `${label} (${badgeLabel})` : label}
      </TooltipContent>
    </Tooltip>
  );
}

function StorefrontLink({
  collapsed,
  label,
  tooltipSide,
}: {
  collapsed: boolean;
  label: string;
  tooltipSide: "left" | "right";
}) {
  if (collapsed) {
    return (
      <Tooltip delayDuration={150}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="w-full rounded-lg text-muted-foreground hover:bg-brand/10 hover:text-brand"
            asChild
            aria-label={label}
          >
            <a href={env.storefrontUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="size-4" aria-hidden="true" />
            </a>
          </Button>
        </TooltipTrigger>
        <TooltipContent side={tooltipSide} sideOffset={10}>
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Button
      variant="ghost"
      className="group h-auto w-full justify-start gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-brand hover:bg-brand/10"
      asChild
    >
      <a href={env.storefrontUrl} target="_blank" rel="noreferrer">
        <span className="flex size-7 flex-none items-center justify-center rounded-lg bg-brand/10 transition-colors group-hover:bg-brand">
          <ExternalLink className="size-3.5 text-brand transition-colors group-hover:text-brand-foreground" />
        </span>
        <span className="flex-1 text-start">{label}</span>
        <ChevronRight className="size-3.5 opacity-50 rtl:rotate-180" aria-hidden="true" />
      </a>
    </Button>
  );
}

export function AdminSidebar({
  collapsed,
  onCollapsedChange,
  onNavigate,
  hideCollapseButton = false,
  className,
}: AdminSidebarProps) {
  const t = useTranslation();
  const { direction } = useLocalization();
  const ability = useAbility();
  const isRTL = direction === "rtl";
  const tooltipSide = isRTL ? "left" : "right";
  const ordersNeedsActionCount = useOrderNeedsActionCount();

  const visibleSections = useMemo(
    () =>
      adminNavigationSections
        .map((section) => ({
          ...section,
          items: section.items
            .filter((item) => canAccessNavItem(ability, item))
            .map((item) =>
              item.id === "orders" && ordersNeedsActionCount > 0
                ? { ...item, badge: ordersNeedsActionCount }
                : item,
            ),
        }))
        .filter((section) => section.items.length > 0),
    [ability, ordersNeedsActionCount],
  );

  const CollapsePanelIcon = collapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <aside
      className={cn(
        "flex h-full flex-none flex-col overflow-hidden border-e border-border bg-card transition-[width] duration-300",
        collapsed ? "w-[4.5rem]" : "w-[288px]",
        className,
      )}
    >
      <div
        className={cn(
          "relative flex h-16 flex-none items-center border-b border-border/60",
          collapsed ? "justify-center px-2" : "gap-2 px-3 pe-2",
        )}
      >
        {!collapsed ? (
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <div className="flex size-8 flex-none items-center justify-center rounded-xl bg-brand text-brand-foreground">
              <Shield className="size-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <CardTitleText className="truncate text-sm font-black leading-none">
                {t.parkourBrand}
              </CardTitleText>
              <CaptionText className="text-[10px] text-muted-foreground">{t.adminPanel}</CaptionText>
            </div>
          </div>
        ) : (
          <Tooltip delayDuration={150}>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="flex size-8 items-center justify-center rounded-xl bg-brand text-brand-foreground transition-opacity hover:opacity-90"
                onClick={() => onCollapsedChange(false)}
                aria-label={t.expandSidebar}
              >
                <Shield className="size-4" aria-hidden="true" />
              </button>
            </TooltipTrigger>
            <TooltipContent side={tooltipSide} sideOffset={10}>
              {t.expandSidebar}
            </TooltipContent>
          </Tooltip>
        )}

        {!hideCollapseButton ? (
          collapsed ? null : (
            <Tooltip delayDuration={150}>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8 shrink-0 rounded-lg border-border/70 bg-background text-muted-foreground shadow-none hover:bg-muted hover:text-foreground"
                  onClick={() => onCollapsedChange(true)}
                  aria-label={t.collapseSidebar}
                  aria-expanded={!collapsed}
                >
                  <CollapsePanelIcon
                    className={cn("size-4", isRTL && "rotate-180")}
                    aria-hidden="true"
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent side={tooltipSide} sideOffset={10}>
                {t.collapseSidebar}
              </TooltipContent>
            </Tooltip>
          )
        ) : null}
      </div>

      <nav className="flex-1 overflow-x-hidden overflow-y-auto px-2 py-3" aria-label={t.adminPanel}>
        {visibleSections.map((section, sectionIndex) => (
          <div
            key={section.id}
            className={cn(sectionIndex > 0 && "mt-4 border-t border-border/60 pt-4")}
          >
            {!collapsed ? (
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-accent-brand">
                {t[section.labelKey]}
              </p>
            ) : sectionIndex > 0 ? (
              <div className="mb-2 border-t border-border/60" />
            ) : null}

            <div className="space-y-0.5">
              {section.items.map((item) => (
                <SidebarNavItem
                  key={item.id}
                  item={item}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                  label={t[item.labelKey]}
                  tooltipSide={tooltipSide}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="flex-none space-y-1 border-t border-border/60 p-2">
        {collapsed && !hideCollapseButton ? (
          <Tooltip delayDuration={150}>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="w-full rounded-lg border-border/70 bg-background text-muted-foreground shadow-none hover:bg-muted hover:text-foreground"
                onClick={() => onCollapsedChange(false)}
                aria-label={t.expandSidebar}
                aria-expanded={false}
              >
                <CollapsePanelIcon
                  className={cn("size-4", isRTL && "rotate-180")}
                  aria-hidden="true"
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent side={tooltipSide} sideOffset={10}>
              {t.expandSidebar}
            </TooltipContent>
          </Tooltip>
        ) : null}

        <StorefrontLink
          collapsed={collapsed}
          label={t.goToWebsite}
          tooltipSide={tooltipSide}
        />
      </div>
    </aside>
  );
}
