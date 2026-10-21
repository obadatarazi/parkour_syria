import { cn } from "@/shared/design-system/components/ui/utils";

const badgeStyles = {
  neutral: "bg-muted text-muted-foreground border-border",
  brand: "bg-brand-muted text-brand border-brand/20",
  success: "bg-success-muted text-success border-success/20",
  warning: "bg-warning-muted text-warning border-warning/20",
  danger: "bg-destructive/10 text-destructive border-destructive/20",
  info: "bg-info-muted text-info border-info/20",
} as const;

export type AppBadgeVariant = keyof typeof badgeStyles;

type AppBadgeProps = {
  label: string;
  variant?: AppBadgeVariant;
  className?: string;
};

export function AppBadge({ label, variant = "neutral", className }: AppBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold",
        badgeStyles[variant],
        className,
      )}
    >
      {label}
    </span>
  );
}
