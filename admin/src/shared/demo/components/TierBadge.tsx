import { cn } from "@/shared/design-system/components/ui/utils";

const tierStyles: Record<string, string> = {
  Gold: "bg-warning-muted text-warning border-warning/30",
  Silver: "bg-muted text-muted-foreground border-border",
  Bronze: "bg-brand-muted text-brand border-brand/20",
  Platinum: "bg-info-muted text-info border-info/20",
};

type TierBadgeProps = {
  tier: string;
  className?: string;
};

export function TierBadge({ tier, className }: TierBadgeProps) {
  return (
    <span
      className={cn(
        "rounded-full border px-2 py-0.5 text-xs font-bold",
        tierStyles[tier] ?? tierStyles.Bronze,
        className,
      )}
    >
      {tier}
    </span>
  );
}
