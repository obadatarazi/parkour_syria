import { Home, Loader2, Menu, Star, type LucideIcon } from "lucide-react";

import type { CategoryQuickToggleField } from "@/features/categories/hooks/use-category-mutations";
import type { Category } from "@/features/categories/types/categories.types";
import { categoryAllowsMerchandisingFlags } from "@/features/categories/utils/category-tree.utils";
import { StatusBadge } from "@/shared/components";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/design-system/components/ui/tooltip";
import { cn } from "@/shared/design-system/components/ui/utils";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type CategoryVisibilityBadgesProps = {
  category: Pick<
    Category,
    | "publish"
    | "showMenu"
    | "showInHomePage"
    | "feature"
    | "hasChildren"
    | "childrenCount"
    | "children"
  >;
  /** Compact icon chips for table cells. */
  compact?: boolean;
  canUpdate?: boolean;
  onToggle?: (field: CategoryQuickToggleField, value: boolean) => void;
  isToggleLoading?: (field: CategoryQuickToggleField) => boolean;
  dataGuidance?: string;
};

type VisibilityFlag = {
  key: Exclude<CategoryQuickToggleField, "publish">;
  active: boolean;
  label: string;
  Icon: LucideIcon;
  /** Parent-only merchandising flags (hidden on leaves). */
  requiresChildren?: boolean;
};

function VisibilityFlagChip({
  label,
  Icon,
  active,
  interactive,
  isLoading,
  onToggle,
}: {
  label: string;
  Icon: LucideIcon;
  active: boolean;
  interactive: boolean;
  isLoading: boolean;
  onToggle?: () => void;
}) {
  const content = (
    <span
      className={cn(
        "inline-flex size-5 shrink-0 items-center justify-center rounded border transition-colors",
        active
          ? "border-info/35 bg-info-muted/80 text-info"
          : "border-border bg-background text-muted-foreground",
        interactive &&
          !isLoading &&
          active &&
          "cursor-pointer hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive",
        interactive &&
          !isLoading &&
          !active &&
          "cursor-pointer hover:border-success/40 hover:bg-success-muted hover:text-success",
        interactive && isLoading && "cursor-wait opacity-70",
        !interactive && "pointer-events-none",
      )}
      aria-label={label}
      aria-pressed={interactive ? active : undefined}
    >
      {isLoading ? (
        <Loader2 className="size-3 animate-spin" aria-hidden="true" />
      ) : (
        <Icon className="size-3" strokeWidth={2} aria-hidden="true" />
      )}
    </span>
  );

  if (!interactive) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">{content}</span>
        </TooltipTrigger>
        <TooltipContent side="top">{label}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          disabled={isLoading}
          aria-label={label}
          aria-pressed={active}
          className="inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={(event) => {
            event.stopPropagation();
            onToggle?.();
          }}
        >
          {content}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}

export function CategoryVisibilityBadges({
  category,
  compact = false,
  canUpdate = false,
  onToggle,
  isToggleLoading,
  dataGuidance,
}: CategoryVisibilityBadgesProps) {
  const t = useTranslation();
  const interactive = Boolean(compact && canUpdate && onToggle);
  const allowsMerchandising = categoryAllowsMerchandisingFlags(category);

  const flags: VisibilityFlag[] = [
    {
      key: "showMenu",
      active: Boolean(category.showMenu),
      label: t.showMenu,
      Icon: Menu,
    },
    {
      key: "showInHomePage",
      active: Boolean(category.showInHomePage),
      label: t.showInHomePage,
      Icon: Home,
      requiresChildren: true,
    },
    {
      key: "feature",
      active: Boolean(category.feature),
      label: t.featured,
      Icon: Star,
      requiresChildren: true,
    },
  ];

  const applicableFlags = flags.filter(
    (flag) => !flag.requiresChildren || allowsMerchandising,
  );
  const visibleFlags = interactive
    ? applicableFlags
    : applicableFlags.filter((flag) => flag.active);
  const isPublishLoading = Boolean(isToggleLoading?.("publish"));

  if (compact) {
    const statusBadge = (
      <StatusBadge
        label={category.publish ? t.active : t.inactive}
        variant={category.publish ? "success" : "neutral"}
        className={cn(
          interactive && "cursor-pointer transition-colors",
          interactive &&
            !isPublishLoading &&
            category.publish &&
            "hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive",
          interactive &&
            !isPublishLoading &&
            !category.publish &&
            "hover:border-success/40 hover:bg-success-muted hover:text-success",
          interactive && isPublishLoading && "cursor-wait opacity-70",
        )}
      />
    );

    return (
      <div
        className="inline-flex max-w-full items-center justify-center gap-1.5 whitespace-nowrap"
        data-guidance={dataGuidance}
      >
        {interactive ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                disabled={isPublishLoading}
                aria-label={category.publish ? t.active : t.inactive}
                aria-pressed={Boolean(category.publish)}
                className="inline-flex rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={(event) => {
                  event.stopPropagation();
                  onToggle?.("publish", !category.publish);
                }}
              >
                {isPublishLoading ? (
                  <span className="inline-flex size-6 items-center justify-center">
                    <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                  </span>
                ) : (
                  statusBadge
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {category.publish ? t.active : t.inactive}
            </TooltipContent>
          </Tooltip>
        ) : (
          statusBadge
        )}

        {visibleFlags.length > 0 ? (
          <span className="inline-flex items-center gap-1">
            {visibleFlags.map((flag) => (
              <VisibilityFlagChip
                key={flag.key}
                label={flag.label}
                Icon={flag.Icon}
                active={flag.active}
                interactive={interactive}
                isLoading={Boolean(isToggleLoading?.(flag.key))}
                onToggle={() => onToggle?.(flag.key, !flag.active)}
              />
            ))}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1" data-guidance={dataGuidance}>
      <StatusBadge
        label={category.publish ? t.active : t.inactive}
        variant={category.publish ? "success" : "neutral"}
      />
      {flags
        .filter((flag) => flag.active && (!flag.requiresChildren || allowsMerchandising))
        .map((flag) => (
          <StatusBadge key={flag.key} label={flag.label} variant="info" />
        ))}
    </div>
  );
}
