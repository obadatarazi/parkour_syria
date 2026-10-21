import { Award, Heart, Loader2, PackagePlus, Star, type LucideIcon } from "lucide-react";

import type { ProductQuickToggleField } from "@/features/products/hooks/use-product-mutations";
import type { Product } from "@/features/products/types/products.types";
import { StatusBadge } from "@/shared/components";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/design-system/components/ui/tooltip";
import { cn } from "@/shared/design-system/components/ui/utils";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type ProductVisibilityBadgesProps = {
  product: Pick<
    Product,
    "publish" | "featured" | "bestSeller" | "newlyArrived" | "isProductYouWillLove"
  >;
  /** Single-line icon chips for table cells; full labels elsewhere. */
  compact?: boolean;
  canUpdate?: boolean;
  onToggle?: (field: ProductQuickToggleField, value: boolean) => void;
  isToggleLoading?: (field: ProductQuickToggleField) => boolean;
  dataGuidance?: string;
};

type VisibilityFlag = {
  key: ProductQuickToggleField;
  active: boolean;
  label: string;
  Icon: LucideIcon;
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

export function ProductVisibilityBadges({
  product,
  compact = false,
  canUpdate = false,
  onToggle,
  isToggleLoading,
  dataGuidance,
}: ProductVisibilityBadgesProps) {
  const t = useTranslation();
  const interactive = Boolean(compact && canUpdate && onToggle);

  const flags: VisibilityFlag[] = [
    { key: "featured", active: Boolean(product.featured), label: t.featured, Icon: Star },
    { key: "bestSeller", active: Boolean(product.bestSeller), label: t.bestSeller, Icon: Award },
    {
      key: "newlyArrived",
      active: Boolean(product.newlyArrived),
      label: t.newlyArrived,
      Icon: PackagePlus,
    },
    {
      key: "isProductYouWillLove",
      active: Boolean(product.isProductYouWillLove),
      label: t.isProductYouWillLove,
      Icon: Heart,
    },
  ];

  const visibleFlags = interactive ? flags : flags.filter((flag) => flag.active);
  const isPublishLoading = Boolean(isToggleLoading?.("publish"));

  if (compact) {
    const statusBadge = (
      <StatusBadge
        label={product.publish ? t.active : t.inactive}
        variant={product.publish ? "success" : "neutral"}
        className={cn(
          interactive && "cursor-pointer transition-colors",
          interactive &&
            !isPublishLoading &&
            product.publish &&
            "hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive",
          interactive &&
            !isPublishLoading &&
            !product.publish &&
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
                aria-label={product.publish ? t.active : t.inactive}
                aria-pressed={Boolean(product.publish)}
                className="inline-flex rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={(event) => {
                  event.stopPropagation();
                  onToggle?.("publish", !product.publish);
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
            <TooltipContent side="top">{product.publish ? t.active : t.inactive}</TooltipContent>
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
        label={product.publish ? t.active : t.inactive}
        variant={product.publish ? "success" : "neutral"}
      />
      {flags
        .filter((flag) => flag.active)
        .map((flag) => (
          <StatusBadge key={flag.key} label={flag.label} variant="info" />
        ))}
    </div>
  );
}
