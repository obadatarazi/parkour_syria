import { type LucideIcon, TrendingDown, TrendingUp } from "lucide-react";
import { type ReactNode } from "react";

import { ResponsiveGrid } from "@/shared/components/layout/ResponsiveGrid";
import { CardTitleText } from "@/shared/components/typography/Typography";
import { Card, CardContent, CardHeader } from "@/shared/design-system/components/ui/card";
import { cn } from "@/shared/design-system/components/ui/utils";

type StatCardTone = "brand" | "success" | "warning" | "danger";

type StatCardProps = {
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  /** When false, an increase is shown in red (e.g. abandoned carts). */
  higherIsBetter?: boolean;
  icon?: LucideIcon;
  iconTone?: StatCardTone;
  className?: string;
};

const ICON_TONE_CLASSES: Record<StatCardTone, string> = {
  brand: "bg-brand-muted text-brand",
  success: "bg-success-muted text-success",
  warning: "bg-warning-muted text-warning",
  danger: "bg-destructive/10 text-destructive",
};

const VALUE_TONE_CLASSES: Record<StatCardTone, string> = {
  brand: "text-foreground",
  success: "text-foreground",
  warning: "text-warning",
  danger: "text-destructive",
};

export function StatCard({
  label,
  value,
  change,
  trend = "neutral",
  higherIsBetter = true,
  icon: Icon,
  iconTone = "brand",
  className,
}: StatCardProps) {
  const TrendIcon = trend === "down" ? TrendingDown : TrendingUp;
  const isFavorable =
    trend === "neutral" ? null : higherIsBetter ? trend === "up" : trend === "down";

  return (
    <Card className={cn("gap-0 py-0 shadow-sm transition-shadow duration-200", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 border-0 px-6 pt-6 pb-4">
        {Icon ? (
          <div
            className={cn(
              "flex size-10 items-center justify-center rounded-lg",
              ICON_TONE_CLASSES[iconTone],
            )}
          >
            <Icon className="size-5" aria-hidden="true" />
          </div>
        ) : (
          <span />
        )}
        {change ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold",
              isFavorable === true && "bg-success-muted text-success",
              isFavorable === false && "bg-destructive/10 text-destructive",
              isFavorable === null && "bg-muted text-muted-foreground",
            )}
          >
            {trend !== "neutral" ? <TrendIcon className="size-3" aria-hidden="true" /> : null}
            {change}
          </span>
        ) : null}
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <p
          className={cn(
            "text-2xl font-bold tracking-tight",
            value !== "0" ? VALUE_TONE_CLASSES[iconTone] : "text-foreground",
          )}
        >
          {value}
        </p>
        <CardTitleText as="p" className="mt-1 text-sm font-medium text-muted-foreground">
          {label}
        </CardTitleText>
      </CardContent>
    </Card>
  );
}

type StatCardGridProps = {
  children: ReactNode;
  className?: string;
};

export function StatCardGrid({ children, className }: StatCardGridProps) {
  return (
    <ResponsiveGrid columns={4} className={className}>
      {children}
    </ResponsiveGrid>
  );
}
